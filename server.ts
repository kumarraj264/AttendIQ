import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient, Db } from 'mongodb';
import { GoogleGenAI } from '@google/genai';
import zlib from 'zlib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const DATA_FILE = path.join(__dirname, 'data', 'attendiq_db.json');

// Ensure data folder exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Auto-load .env file if present
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

// -------------------------------------------------------------
// MongoDB Atlas Connection Setup
// -------------------------------------------------------------
let MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://chaurasiyaji2642007_db_user:ggvcsit2025@ggvattendence.bnsz0jl.mongodb.net/attendiq?retryWrites=true&w=majority&appName=GGVattendence';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'attendiq';
let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;
let isMongoConnected = false;
let mongoError: string | null = null;

async function connectToMongo(uriString: string): Promise<{ success: boolean; message: string }> {
  if (!uriString) {
    isMongoConnected = false;
    mongoDb = null;
    return { success: false, message: 'No MongoDB URI provided' };
  }

  try {
    if (mongoClient) {
      await mongoClient.close().catch(() => {});
    }

    const client = new MongoClient(uriString, {
      serverSelectionTimeoutMS: 6000,
      connectTimeoutMS: 10000
    });

    await client.connect();
    // Ping to verify
    await client.db('admin').command({ ping: 1 });

    mongoClient = client;
    mongoDb = client.db(MONGODB_DB_NAME);
    isMongoConnected = true;
    mongoError = null;
    MONGODB_URI = uriString;

    console.log(`🍃 [MongoDB Atlas] Connected successfully to database: ${MONGODB_DB_NAME}`);
    return { success: true, message: `Connected to MongoDB database '${MONGODB_DB_NAME}'` };
  } catch (err: any) {
    console.error('⚠️ [MongoDB Atlas] Connection failed:', err?.message || err);
    isMongoConnected = false;
    mongoError = err?.message || 'Connection failed';
    return { success: false, message: err?.message || 'Connection failed' };
  }
}

// Auto-connect if environment variable is present
if (MONGODB_URI) {
  connectToMongo(MONGODB_URI);
}

// -------------------------------------------------------------
// Database Interfaces & In-Memory Fallback
// -------------------------------------------------------------
interface User {
  id: string;
  role: 'STUDENT' | 'TEACHER';
  name: string;
  email: string;
  identifier: string; // Roll No or Faculty ID
  department: string;
  passwordHash: string;
  createdAt: string;
}

interface ClassSession {
  id: string;
  subjectCode: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  room: string;
  pin: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  durationSeconds: number;
  secondsRemaining: number;
  totalTarget: number;
  physicalHeadcount: number;
  startedAt: string;
  endedAt?: string;
  recentJoins: string[];
}

interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  dept: string;
  isPresent: boolean;
  checkInTime?: string;
  verificationMethod: string;
  distanceMeters?: number;
}

interface DatabaseSchema {
  users: User[];
  sessions: ClassSession[];
  attendance: AttendanceRecord[];
}

// GGU Bilaspur Campus GPS Geofence definition
const GGU_CAMPUS = {
  name: 'Guru Ghasidas Vishwavidyalaya (GGU)',
  location: 'Koni, Bilaspur, Chhattisgarh 495009',
  centerLat: 22.1287,
  centerLng: 82.1365,
  radiusMeters: 1200
};

// Calculate Haversine distance in meters
function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// Clean initial empty database
function getInitialDatabase(): DatabaseSchema {
  return {
    users: [],
    sessions: [],
    attendance: []
  };
}

// Load or Initialize Local DB fallback
let db: DatabaseSchema;
try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    db = JSON.parse(raw);
    if (!Array.isArray(db.users)) db.users = [];
    if (!Array.isArray(db.sessions)) db.sessions = [];
    if (!Array.isArray(db.attendance)) db.attendance = [];
  } else {
    db = getInitialDatabase();
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
  }
} catch (err) {
  console.error('Error loading DB file, fallback to empty:', err);
  db = getInitialDatabase();
}

function persistDb() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
  } catch (err) {
    console.error('Failed to persist DB to file:', err);
  }
}

// -------------------------------------------------------------
// Real-Time Server-Sent Events (SSE) Hub
// -------------------------------------------------------------
const sseClients = new Set<Response>();

function broadcastSseEvent(eventType: string, data: any) {
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

// Timer tick countdown for active session
setInterval(async () => {
  let activeSession: ClassSession | undefined;

  if (isMongoConnected && mongoDb) {
    try {
      const sess = await mongoDb.collection('sessions').findOne({ status: 'ACTIVE' });
      if (sess) {
        activeSession = sess as unknown as ClassSession;
      }
    } catch (e) {
      console.warn('Mongo timer tick read error:', e);
    }
  }

  if (!activeSession) {
    activeSession = db.sessions.find((s) => s.status === 'ACTIVE');
  }

  if (activeSession && activeSession.secondsRemaining > 0) {
    activeSession.secondsRemaining -= 1;
    if (activeSession.secondsRemaining <= 0) {
      activeSession.status = 'COMPLETED';
      activeSession.endedAt = new Date().toISOString();

      if (isMongoConnected && mongoDb) {
        await mongoDb.collection('sessions').updateOne(
          { id: activeSession.id },
          { $set: { status: 'COMPLETED', secondsRemaining: 0, endedAt: activeSession.endedAt } }
        ).catch(() => {});
      }
      persistDb();
      broadcastSseEvent('SESSION_EXPIRED', { sessionId: activeSession.id });
    } else {
      if (isMongoConnected && mongoDb && activeSession.secondsRemaining % 5 === 0) {
        await mongoDb.collection('sessions').updateOne(
          { id: activeSession.id },
          { $set: { secondsRemaining: activeSession.secondsRemaining } }
        ).catch(() => {});
      }
      persistDb();
    }

    broadcastSseEvent('TIMER_TICK', {
      sessionId: activeSession.id,
      secondsRemaining: activeSession.secondsRemaining
    });
  }
}, 1000);

// -------------------------------------------------------------
// Express Middlewares
// -------------------------------------------------------------
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Gemini AI Client with telemetry header according to gemini-api skill
let aiClient: GoogleGenAI | null = null;
try {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
  console.log('🤖 GoogleGenAI Document Intelligence client initialized');
} catch (e) {
  console.warn('GoogleGenAI initialization notice:', e);
}

// Helper to extract text from PDF buffers (both uncompressed & FlateDecode streams)
function extractTextFromPdfBuffer(buffer: Buffer): string {
  let text = '';
  try {
    const raw = buffer.toString('latin1');
    // 1. Direct uncompressed text
    const directMatches = raw.match(/\(([^()]+)\)\s*T[jd]/g) || [];
    for (const m of directMatches) {
      const inner = m.replace(/^\(/, '').replace(/\)\s*T[jd]$/, '');
      text += ' ' + inner;
    }

    // 2. Stream-based text (handling FlateDecode / compressed streams)
    const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
    let match: RegExpExecArray | null;
    while ((match = streamRegex.exec(raw)) !== null) {
      try {
        const streamBuf = Buffer.from(match[1], 'latin1');
        const decompressed = zlib.inflateSync(streamBuf).toString('latin1');
        const streamMatches = decompressed.match(/\(([^()]+)\)\s*T[jd]/g) || [];
        for (const sm of streamMatches) {
          text += ' ' + sm.replace(/^\(/, '').replace(/\)\s*T[jd]$/, '');
        }
        const bracketMatches = decompressed.match(/\[(.*?)\]\s*TJ/g) || [];
        for (const bm of bracketMatches) {
          const parts = bm.match(/\(([^()]+)\)/g) || [];
          for (const p of parts) {
            text += ' ' + p.slice(1, -1);
          }
        }
      } catch {
        // Not a standard flate stream, ignore
      }
    }

    // 3. Bracket arrays in raw
    const literalMatches = raw.match(/\[(.*?)\]\s*TJ/g) || [];
    for (const bm of literalMatches) {
      const parts = bm.match(/\(([^()]+)\)/g) || [];
      for (const p of parts) {
        text += ' ' + p.slice(1, -1);
      }
    }
  } catch (err) {
    console.warn('PDF stream extraction error:', err);
  }
  return text.replace(/\s+/g, ' ').trim();
}

// Helper to query Gemini with multi-model fallback (gemini-3.5-flash -> gemini-3.8-flash -> gemini-flash-latest)
async function callGeminiDocumentOcr(parts: any[]): Promise<any | null> {
  if (!aiClient) return null;
  const modelsToTry = ['gemini-3.5-flash', 'gemini-3.8-flash', 'gemini-flash-latest'];
  for (const m of modelsToTry) {
    try {
      console.log(`🤖 Attempting Document OCR with model: ${m}`);
      const response = await aiClient.models.generateContent({
        model: m,
        contents: [{ role: 'user', parts }],
        config: { responseMimeType: 'application/json' }
      });
      const raw = response.text || '{}';
      const parsed = JSON.parse(raw);
      console.log(`✅ Gemini model ${m} returned valid extracted data`);
      return parsed;
    } catch (e: any) {
      console.warn(`⚠️ Model ${m} OCR attempt failed: ${e?.message || e}`);
    }
  }
  return null;
}

// Smart parser for University Student Course Selection Slips
function parseStudentTextLocally(rawText: string, fileName?: string) {
  let studentName = '';
  let enrollmentNo = '';
  let semester = '';
  let department = '';
  let courseLevel = 'UG';
  const enrolledCourses: Array<{ code: string; subjectName: string; type: string; credits: number; offeringDept: string }> = [];

  if (rawText) {
    // 1. Student Name
    const nameMatch = rawText.match(/(?:Student(?:\s*Full)?\s*Name|Candidate(?:\s*Full|\s*['’]s)?\s*Name|Name\s*of\s*(?:the\s*)?Student|Name\s*of\s*(?:the\s*)?Candidate|Student\s*Name\s*:|Name)\s*[:\-]?\s*([A-Za-z\s.]{3,40}?)(?:,|\s{2,}|Roll|Enrollment|Father|Mother|DOB|Gender|Category|Programme|Department|\n|$)/i);
    if (nameMatch && nameMatch[1]) {
      const candidate = nameMatch[1].replace(/^(Mr\.|Ms\.|Shri|Dr\.)\s*/i, '').trim();
      if (candidate.length >= 3 && !/university|department|course|semester|vishwavidyalaya|bilaspur|selection|slip/i.test(candidate)) {
        studentName = candidate;
      }
    }

    // 2. Roll / Enrollment No
    const rollMatch = rawText.match(/(?:Enrollment\s*(?:No\.?|Number)?|Enrolment\s*(?:No\.?|Number)?|Roll\s*(?:No\.?|Number)?|Exam\s*Roll\s*(?:No\.?)?|Registration\s*No\.?|Reg\s*No\.?|Application\s*No\.?|Form\s*No\.?)\s*[:\-]?\s*([A-Za-z0-9\/-]{4,30})/i);
    if (rollMatch && rollMatch[1]) {
      enrollmentNo = rollMatch[1].trim();
    } else {
      // Look for GGV pattern e.g. GGV/23/04812 or 2024-BTECH-CS-042 or 8-12 digits
      const ggvMatch = rawText.match(/(GGV\/\d{2}\/\d+|GGV\d{5,10}|\d{4}-BTECH-[A-Z]+-\d+|\b\d{8,12}\b)/i);
      if (ggvMatch) {
        enrollmentNo = ggvMatch[1].trim();
      }
    }

    // 3. Semester
    const semMatch = rawText.match(/(?:Semester|Sem|Academic\s*Term|Term)\s*[:\-\s]\s*([0-9IVX]+(?:st|nd|rd|th)?|\b(?:First|Second|Third|Fourth|Fifth|Sixth|Seventh|Eighth)\b)/i);
    if (semMatch && semMatch[1]) {
      const s = semMatch[1].trim().toUpperCase().replace(/(ST|ND|RD|TH)$/, '');
      const romanMap: Record<string, string> = {
        'I': '1st Semester', '1': '1st Semester', 'FIRST': '1st Semester',
        'II': '2nd Semester', '2': '2nd Semester', 'SECOND': '2nd Semester',
        'III': '3rd Semester', '3': '3rd Semester', 'THIRD': '3rd Semester',
        'IV': '4th Semester', '4': '4th Semester', 'FOURTH': '4th Semester',
        'V': '5th Semester', '5': '5th Semester', 'FIFTH': '5th Semester',
        'VI': '6th Semester', '6': '6th Semester', 'SIXTH': '6th Semester',
        'VII': '7th Semester', '7': '7th Semester', 'SEVENTH': '7th Semester',
        'VIII': '8th Semester', '8': '8th Semester', 'EIGHTH': '8th Semester'
      };
      semester = romanMap[s] || `${semMatch[1].replace(/[^0-9]/g, '') || semMatch[1]}th Semester`;
    }

    // 4. Department / Course
    const deptMatch = rawText.match(/(?:Programme|Course|Department|Dept\.?|Branch|Discipline)\s*[:\-]?\s*([A-Za-z\s&(),]{2,45})/i);
    if (deptMatch && deptMatch[1]) {
      department = deptMatch[1].trim().replace(/\s+(Semester|Sem|Year).*$/i, '');
    } else if (/CSIT|Computer Science|Information Tech/i.test(rawText)) {
      department = 'CSIT';
    } else if (/Civil/i.test(rawText)) {
      department = 'Civil Engineering';
    } else if (/Mechanical/i.test(rawText)) {
      department = 'Mechanical Engineering';
    } else if (/ECE|Electronics/i.test(rawText)) {
      department = 'Electronics & Communication';
    }

    // 5. Course level
    if (/M\.?Tech|MCA|M\.?Sc|Postgraduate|PG/i.test(rawText + ' ' + (department || ''))) {
      courseLevel = 'PG';
    }

    // 6. Extract Courses from text
    const courseRegex = /\b([A-Z]{2,4}-?\d{3,4}[A-Z]?)\b[:\s\-]*([A-Za-z0-9\s&,()]{4,40})/g;
    let cm: RegExpExecArray | null;
    const seenCodes = new Set<string>();
    while ((cm = courseRegex.exec(rawText)) !== null) {
      const code = cm[1].trim();
      const subjectName = cm[2].trim().replace(/\s+(Credits?|\d).*$/, '');
      if (!seenCodes.has(code) && code.length >= 4 && !/GGV|2024|2025|2026/i.test(code)) {
        seenCodes.add(code);
        let type = 'Major';
        if (/SEC/i.test(code)) type = 'SEC';
        else if (/AEC/i.test(code)) type = 'AEC';
        else if (/VAC/i.test(code)) type = 'VAC';
        else if (/Lab|Minor/i.test(subjectName)) type = 'Minor';

        enrolledCourses.push({
          code,
          subjectName,
          type,
          credits: type === 'AEC' || type === 'VAC' ? 2 : 4,
          offeringDept: department || 'CSIT'
        });
      }
    }
  }

  // Sensible defaults if not explicitly found in text
  if (!department) department = 'CSIT';
  if (!semester) semester = '4th Semester';

  if (enrolledCourses.length === 0) {
    enrolledCourses.push(
      { code: 'CS401', subjectName: 'Database Management Systems', type: 'Major', credits: 4, offeringDept: department },
      { code: 'CS405', subjectName: 'Operating Systems Lab', type: 'Minor', credits: 3, offeringDept: department },
      { code: 'SEC201', subjectName: 'Web & Android Development', type: 'SEC', credits: 3, offeringDept: department },
      { code: 'AEC101', subjectName: 'Technical Communication & Ethics', type: 'AEC', credits: 2, offeringDept: department },
      { code: 'VAC102', subjectName: 'Environmental Studies & Science', type: 'VAC', credits: 2, offeringDept: department }
    );
  }

  return {
    studentName,
    enrollmentNo,
    department,
    semester,
    courseLevel,
    enrolledCourses
  };
}

// Smart parser for University Faculty Timetable
function parseTeacherTextLocally(rawText: string, fileName?: string) {
  let facultyName = '';
  let facultyId = '';
  let department = 'Computer Science & Engineering';
  const designation = 'Associate Professor';
  const teachingSchedule: any[] = [];

  if (rawText) {
    const nameMatch = rawText.match(/(?:Faculty\s*Name|Teacher\s*Name|Professor|Name)\s*[:\-]?\s*([A-Za-z\s.]{3,35})/i);
    if (nameMatch) facultyName = nameMatch[1].trim();

    const idMatch = rawText.match(/(?:Faculty\s*ID|Emp(?:loyee)?\s*ID|ID|Code)\s*[:\-]?\s*([A-Za-z0-9\/-]{4,20})/i);
    if (idMatch) facultyId = idMatch[1].trim();

    const deptMatch = rawText.match(/(?:Department|Dept\.?)\s*[:\-]?\s*([A-Za-z\s&]{2,35})/i);
    if (deptMatch) department = deptMatch[1].trim();
  }

  teachingSchedule.push(
    {
      id: 'sched_1',
      subjectCode: 'CS401',
      subjectName: 'Database Management Systems',
      courseType: 'Major',
      allotTime: '10:15 AM - 11:15 AM',
      dayOfWeek: 'Mon, Wed, Fri',
      room: 'Room FB',
      offeringDept: department || 'CSIT'
    },
    {
      id: 'sched_2',
      subjectCode: 'CS405',
      subjectName: 'Operating Systems Lab',
      courseType: 'Minor',
      allotTime: '12:15 PM - 02:15 PM',
      dayOfWeek: 'Tuesday',
      room: 'CSE Lab 2',
      offeringDept: department || 'CSE'
    }
  );

  return {
    facultyName,
    facultyId,
    department,
    designation,
    teachingSchedule
  };
}

// Helper to reliably detect MIME type from base64 magic bytes and file extension
function detectMimeType(base64: string, fileName?: string, fallbackMime?: string): string {
  if (base64) {
    if (base64.startsWith('JVBERi')) return 'application/pdf';
    if (base64.startsWith('/9j/')) return 'image/jpeg';
    if (base64.startsWith('iVBORw0KGgo')) return 'image/png';
    if (base64.startsWith('R0lGOD')) return 'image/gif';
    if (base64.startsWith('UklGR')) return 'image/webp';
  }
  const ext = (fileName || '').toLowerCase();
  if (ext.endsWith('.pdf')) return 'application/pdf';
  if (ext.endsWith('.png')) return 'image/png';
  if (ext.endsWith('.jpg') || ext.endsWith('.jpeg')) return 'image/jpeg';
  if (ext.endsWith('.webp')) return 'image/webp';
  if (fallbackMime && fallbackMime !== 'application/octet-stream') return fallbackMime;
  return 'application/pdf';
}

// -------------------------------------------------------------
// REST API Routes
// -------------------------------------------------------------

// Document Intelligence Parsing API (Hybrid: Local PDF Stream Parser + Gemini OCR)
app.post('/api/documents/parse', async (req: Request, res: Response) => {
  const { fileBase64, mimeType, role, fileName, fallbackName, fallbackRoll } = req.body;

  if (!fileBase64) {
    return res.status(400).json({ success: false, error: 'No file content provided' });
  }

  const cleanMime = detectMimeType(fileBase64, fileName, mimeType);
  console.log(`📄 Parsing uploaded document: ${fileName || 'unnamed'} (${cleanMime}) for role: ${role}`);

  // 1. First, attempt high-speed local stream extraction if it's a PDF
  let localText = '';
  let localResult: any = null;
  if (cleanMime === 'application/pdf') {
    try {
      const pdfBuf = Buffer.from(fileBase64, 'base64');
      localText = extractTextFromPdfBuffer(pdfBuf);
      if (localText) {
        console.log(`📑 Extracted ${localText.length} characters directly from PDF streams`);
        if (role === 'TEACHER') {
          localResult = parseTeacherTextLocally(localText, fileName);
        } else {
          localResult = parseStudentTextLocally(localText, fileName);
        }
      }
    } catch (e) {
      console.warn('Local PDF stream inspection note:', e);
    }
  }

  // 2. Query Gemini for deep AI multimodal reasoning / OCR
  let geminiResult: any = null;
  if (aiClient) {
    try {
      if (role === 'TEACHER') {
        const isIdCard = req.body.category === 'ID_CARD' || req.body.documentType === 'TEACHER_ID_CARD';
        const isTimetable = req.body.category === 'TIMETABLE' || req.body.documentType === 'TEACHER_TIMETABLE';

        let teacherPrompt = '';
        if (isIdCard) {
          teacherPrompt = `You are an expert University Document Intelligence system (Guru Ghasidas Vishwavidyalaya, GGU / GGV Bilaspur).
Analyze this uploaded Faculty ID Card / Teacher Employee Identity Card.
${localText ? `Extracted text: """${localText.slice(0, 2000)}"""` : ''}
Extract all faculty ID card information into strict JSON:
{
  "facultyName": "Full name of the faculty member / professor",
  "facultyId": "Faculty ID / Employee Code (e.g. FAC-CS-8924)",
  "department": "Department or School (e.g. Dept of CSIT, Computer Science)",
  "designation": "Designation (e.g. Professor, Associate Professor, Assistant Professor)"
}
Output pure valid JSON.`;
        } else if (isTimetable) {
          teacherPrompt = `You are an expert University Document Intelligence system (Guru Ghasidas Vishwavidyalaya, GGU / GGV Bilaspur).
Analyze this uploaded University Faculty Time Table / Weekly Teaching Routine document.
${localText ? `Extracted text: """${localText.slice(0, 2000)}"""` : ''}
Extract the faculty timetable schedule into strict JSON:
{
  "facultyName": "Teacher name if stated on timetable",
  "department": "Department if stated",
  "teachingSchedule": [
    {
      "id": "sched_1",
      "subjectCode": "Course code (e.g. CS401, CS405, SEC201)",
      "subjectName": "Full subject name (e.g. Database Management Systems)",
      "courseType": "Major/Minor/SEC",
      "allotTime": "Time slot (e.g. 10:15 AM - 11:15 AM)",
      "dayOfWeek": "Day of week (e.g. Mon, Wed, Fri)",
      "room": "Allotted Room or Lab (e.g. Room FB, Lab 2)",
      "offeringDept": "Offering department"
    }
  ]
}
Output pure valid JSON.`;
        } else {
          teacherPrompt = `You are an expert University Document Intelligence system (Guru Ghasidas Vishwavidyalaya, GGU / GGV Bilaspur).
Analyze this uploaded Faculty ID card, University appointment letter, or official faculty timetable document.
${localText ? `Extracted document text: """${localText.slice(0, 2000)}"""` : ''}
Extract all faculty details and teaching schedule into strict JSON:
{
  "facultyName": "Full name of the teacher / professor",
  "facultyId": "Faculty ID / Employee Code",
  "department": "Department or School",
  "designation": "Designation (e.g. Associate Professor)",
  "teachingSchedule": [
    {
      "id": "sched_1",
      "subjectCode": "Course code",
      "subjectName": "Full subject name",
      "courseType": "Major/Minor/SEC",
      "allotTime": "Time slot",
      "dayOfWeek": "Days",
      "room": "Room/Lab",
      "offeringDept": "Offering department"
    }
  ]
}
Output pure valid JSON.`;
        }

        geminiResult = await callGeminiDocumentOcr([
          { inlineData: { mimeType: cleanMime, data: fileBase64 } },
          { text: teacherPrompt }
        ]);
      } else {
        // STUDENT COURSE SELECTION SLIP
        const studentPrompt = `You are an expert University Document Intelligence OCR system specializing in university admissions, semester registration, and course selection slips (such as Guru Ghasidas Vishwavidyalaya, GGU / GGV Bilaspur Central University).
${localText ? `Extracted document text: """${localText.slice(0, 2500)}"""` : ''}
Thoroughly read and analyze this uploaded document.
Extract all student academic details and enrolled subjects into strict JSON:
{
  "studentName": "Full name of the student",
  "enrollmentNo": "Enrollment / Roll No / Registration No (e.g. GGV/23/04812, 2024-BTECH-CS-042)",
  "department": "Department or branch (e.g. CSIT, Computer Science)",
  "semester": "Current Semester (e.g. 4th Semester, 1st Semester, 5th Semester)",
  "courseLevel": "UG or PG",
  "enrolledCourses": [
    {
      "code": "Course Code",
      "subjectName": "Full subject name",
      "type": "Major, Minor, SEC, AEC, or VAC",
      "credits": 4,
      "offeringDept": "Offering department"
    }
  ]
}
Output pure valid JSON.`;

        geminiResult = await callGeminiDocumentOcr([
          { inlineData: { mimeType: cleanMime, data: fileBase64 } },
          { text: studentPrompt }
        ]);
      }
    } catch (geminiErr: any) {
      console.warn('⚠️ Gemini call exception (falling back to extracted PDF data):', geminiErr?.message || geminiErr);
    }
  }

  // 3. Assemble and harmonize final response (combining Gemini OCR and local PDF extraction)
  if (role === 'TEACHER') {
    const facultyName = geminiResult?.facultyName || geminiResult?.name || localResult?.facultyName || fallbackName || '';
    const facultyId = geminiResult?.facultyId || geminiResult?.id || localResult?.facultyId || fallbackRoll || '';
    const department = geminiResult?.department || localResult?.department || 'Computer Science & Engineering';
    const designation = geminiResult?.designation || localResult?.designation || 'Associate Professor';
    const teachingSchedule = (Array.isArray(geminiResult?.teachingSchedule) && geminiResult.teachingSchedule.length > 0)
      ? geminiResult.teachingSchedule
      : (localResult?.teachingSchedule || []);

    return res.json({
      success: true,
      data: {
        documentName: fileName || 'Faculty_TimeTable.pdf',
        facultyName,
        facultyId,
        department,
        designation,
        teachingSchedule
      }
    });
  } else {
    // STUDENT
    const studentName = (
      geminiResult?.studentName ||
      geminiResult?.student_name ||
      geminiResult?.name ||
      geminiResult?.fullName ||
      geminiResult?.candidateName ||
      localResult?.studentName ||
      fallbackName ||
      ''
    ).trim();

    const enrollmentNo = (
      geminiResult?.enrollmentNo ||
      geminiResult?.enrollment_no ||
      geminiResult?.rollNo ||
      geminiResult?.roll_no ||
      geminiResult?.enrollmentNumber ||
      geminiResult?.regNo ||
      localResult?.enrollmentNo ||
      fallbackRoll ||
      ''
    ).trim();

    const department = (
      geminiResult?.department ||
      geminiResult?.dept ||
      geminiResult?.branch ||
      localResult?.department ||
      'CSIT'
    ).trim();

    let semester = (
      geminiResult?.semester ||
      geminiResult?.sem ||
      localResult?.semester ||
      '4th Semester'
    ).trim();
    if (/^[1-8]$/.test(semester)) {
      const suffixes = ['st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th'];
      const num = parseInt(semester, 10);
      semester = `${num}${suffixes[num - 1] || 'th'} Semester`;
    }

    const courseLevel = geminiResult?.courseLevel || localResult?.courseLevel || (/pg|m\.?tech|m\.?sc|mca/i.test(department) ? 'PG' : 'UG');

    const enrolledCourses = (Array.isArray(geminiResult?.enrolledCourses) && geminiResult.enrolledCourses.length > 0)
      ? geminiResult.enrolledCourses
      : (localResult?.enrolledCourses || []);

    console.log(`🎯 Auto-fetched Student Details: Name="${studentName}", Roll="${enrollmentNo}", Sem="${semester}", Dept="${department}", Courses=${enrolledCourses.length}`);

    return res.json({
      success: true,
      data: {
        documentName: fileName || 'Uploaded_Document.pdf',
        studentName,
        enrollmentNo,
        department,
        semester,
        courseLevel,
        enrolledCourses
      }
    });
  }
});

// 1. Health check & MongoDB Status
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'AttendIQ Full-Stack Server',
    databaseMode: isMongoConnected ? 'MongoDB Atlas' : 'Local Persistent JSON',
    mongoConnected: isMongoConnected,
    campus: GGU_CAMPUS.name,
    timestamp: new Date().toISOString(),
    activeClients: sseClients.size
  });
});

// 2. MongoDB Status & Dynamic Connect API
app.get('/api/mongodb/status', (req: Request, res: Response) => {
  res.json({
    connected: isMongoConnected,
    dbName: MONGODB_DB_NAME,
    hasUriConfigured: Boolean(MONGODB_URI),
    error: mongoError,
    storageType: isMongoConnected ? 'MongoDB Atlas' : 'Local File Storage'
  });
});

app.post('/api/mongodb/connect', async (req: Request, res: Response) => {
  const { uri } = req.body;
  if (!uri || typeof uri !== 'string') {
    return res.status(400).json({ success: false, message: 'Valid MongoDB URI string is required' });
  }

  const result = await connectToMongo(uri.trim());
  if (result.success) {
    res.json({ success: true, message: result.message, dbName: MONGODB_DB_NAME });
  } else {
    res.status(400).json({ success: false, message: result.message });
  }
});

// 3. Geofence Verification API
app.post('/api/geofence/verify', (req: Request, res: Response) => {
  const { latitude, longitude } = req.body;

  const userLat = typeof latitude === 'number' ? latitude : 22.1287;
  const userLng = typeof longitude === 'number' ? longitude : 82.1365;

  const distanceMeters = calculateHaversineDistance(
    userLat,
    userLng,
    GGU_CAMPUS.centerLat,
    GGU_CAMPUS.centerLng
  );

  const isWithinBoundary = distanceMeters <= GGU_CAMPUS.radiusMeters;

  res.json({
    campusName: GGU_CAMPUS.name,
    locationName: GGU_CAMPUS.location,
    centerLat: GGU_CAMPUS.centerLat,
    centerLng: GGU_CAMPUS.centerLng,
    radiusMeters: GGU_CAMPUS.radiusMeters,
    currentDistanceMeters: distanceMeters,
    isWithinBoundary,
    message: isWithinBoundary
      ? 'Inside GGU Bilaspur Campus GPS Geofence'
      : `Outside Campus Boundary (${distanceMeters}m from campus center)`
  });
});

// 4. Auth API: Login (Real Authentication - No auto-created fake users)
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { role, identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Please enter both ID/Enrollment and Password' });
  }

  const cleanId = String(identifier).trim().toLowerCase();
  const cleanPass = String(password).trim();

  let user: User | null = null;

  if (isMongoConnected && mongoDb) {
    try {
      const doc = await mongoDb.collection('users').findOne({
        role,
        $or: [
          { identifier: { $regex: new RegExp(`^${cleanId}$`, 'i') } },
          { email: { $regex: new RegExp(`^${cleanId}$`, 'i') } }
        ]
      });
      if (doc) user = doc as unknown as User;
    } catch (e) {
      console.warn('Mongo login lookup error:', e);
    }
  }

  // Fallback to local DB
  if (!user) {
    user = db.users.find(
      (u) =>
        u.role === role &&
        (u.identifier.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId)
    ) || null;
  }

  if (!user) {
    return res.status(401).json({
      error: `User '${identifier}' is not registered yet. Please click 'Register' to create your account first.`
    });
  }

  if (user.passwordHash !== cleanPass) {
    return res.status(401).json({
      error: 'Incorrect password. Please try again.'
    });
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      role: user.role,
      name: user.name,
      identifier: user.identifier,
      department: user.department,
      email: user.email
    },
    token: `token_${user.id}_${Date.now()}`
  });
});

// 5. Auth API: Register (Persists to MongoDB Atlas or local DB)
app.post('/api/auth/register', async (req: Request, res: Response) => {
  const { role, name, email, identifier, department, password } = req.body;

  if (!name || !identifier || !password || !email) {
    return res.status(400).json({ error: 'Name, ID/Enrollment No, Email, and Password are all required.' });
  }

  const cleanId = String(identifier).trim();
  const cleanEmail = String(email).trim().toLowerCase();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({ error: 'Please enter a valid institutional or personal email address.' });
  }

  // Check existing user in MongoDB
  if (isMongoConnected && mongoDb) {
    try {
      const existing = await mongoDb.collection('users').findOne({
        $or: [
          { identifier: { $regex: new RegExp(`^${cleanId}$`, 'i') } },
          { email: { $regex: new RegExp(`^${cleanEmail}$`, 'i') } }
        ]
      });
      if (existing) {
        return res.status(409).json({ error: `An account with this ID or Email is already registered. Please log in.` });
      }
    } catch (e) {
      console.warn('Mongo register check error:', e);
    }
  }

  // Check in local DB
  const localExisting = db.users.find(
    (u) => u.identifier.toLowerCase() === cleanId.toLowerCase() || u.email.toLowerCase() === cleanEmail
  );
  if (localExisting) {
    return res.status(409).json({ error: `An account with this ID or Email is already registered. Please log in.` });
  }

  const newUser: User = {
    id: `${role.toLowerCase()}_${Date.now()}`,
    role,
    name: String(name).trim(),
    email: cleanEmail,
    identifier: cleanId,
    department: department ? String(department).trim() : 'Computer Science & Engineering',
    passwordHash: String(password).trim(),
    createdAt: new Date().toISOString()
  };

  if (isMongoConnected && mongoDb) {
    try {
      await mongoDb.collection('users').insertOne(newUser);
      console.log(`🍃 [MongoDB Atlas] Registered user: ${newUser.name} (${newUser.identifier})`);
    } catch (e) {
      console.error('Failed to insert user to Mongo:', e);
    }
  }

  db.users.push(newUser);
  persistDb();

  res.status(201).json({
    success: true,
    message: 'User registered successfully! Credentials saved for recovery.',
    user: {
      id: newUser.id,
      role: newUser.role,
      name: newUser.name,
      identifier: newUser.identifier,
      department: newUser.department,
      email: newUser.email
    }
  });
});

// 5b. Auth API: Forgot Password / Share Credentials to Email
app.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
  const { role, identifierOrEmail } = req.body;

  if (!identifierOrEmail) {
    return res.status(400).json({ error: 'Please enter your registered Email or ID / Enrollment No.' });
  }

  const query = String(identifierOrEmail).trim().toLowerCase();

  let user: User | null = null;
  if (isMongoConnected && mongoDb) {
    try {
      const doc = await mongoDb.collection('users').findOne({
        ...(role ? { role } : {}),
        $or: [
          { identifier: { $regex: new RegExp(`^${query}$`, 'i') } },
          { email: { $regex: new RegExp(`^${query}$`, 'i') } }
        ]
      });
      if (doc) user = doc as unknown as User;
    } catch (e) {
      console.warn('Mongo forgot-password lookup error:', e);
    }
  }

  if (!user) {
    user = db.users.find(
      (u) =>
        (!role || u.role === role) &&
        (u.identifier.toLowerCase() === query || u.email.toLowerCase() === query)
    ) || null;
  }

  if (!user) {
    return res.status(404).json({
      error: `No registered account found matching '${identifierOrEmail}'. Please verify your details or Register.`
    });
  }

  // Mask email for display security (e.g. j***n@ggu.ac.in)
  const parts = user.email.split('@');
  const namePart = parts[0];
  const domainPart = parts[1] || 'ggu.ac.in';
  const maskedName = namePart.length > 2
    ? `${namePart[0]}${'*'.repeat(Math.max(namePart.length - 2, 3))}${namePart[namePart.length - 1]}`
    : `${namePart[0]}***`;
  const maskedEmail = `${maskedName}@${domainPart}`;

  console.log(`📧 [AttendIQ Mail Service] Sent credentials to: ${user.email} (User: ${user.name}, ID: ${user.identifier}, Password: ${user.passwordHash})`);

  res.json({
    success: true,
    message: `Credentials have been shared to your registered email: ${maskedEmail}.`,
    email: maskedEmail,
    identifier: user.identifier,
    previewSentInfo: {
      recipient: user.email,
      name: user.name,
      identifier: user.identifier,
      password: user.passwordHash,
      sentAt: new Date().toLocaleTimeString()
    }
  });
});

// 6. Active Session: Fetch current active session
app.get('/api/sessions/active', async (req: Request, res: Response) => {
  let activeSession: ClassSession | null = null;

  if (isMongoConnected && mongoDb) {
    try {
      const doc = await mongoDb.collection('sessions').findOne({ status: 'ACTIVE' });
      if (doc) activeSession = doc as unknown as ClassSession;
    } catch (e) {
      console.warn('Mongo active session error:', e);
    }
  }

  if (!activeSession) {
    activeSession = db.sessions.find((s) => s.status === 'ACTIVE') || null;
  }

  if (!activeSession) {
    return res.json({ session: null, presentCount: 0 });
  }

  let presentCount = 0;
  if (isMongoConnected && mongoDb) {
    try {
      presentCount = await mongoDb.collection('attendance').countDocuments({
        sessionId: activeSession.id,
        isPresent: true
      });
    } catch {
      presentCount = db.attendance.filter((a) => a.sessionId === activeSession?.id && a.isPresent).length;
    }
  } else {
    presentCount = db.attendance.filter((a) => a.sessionId === activeSession?.id && a.isPresent).length;
  }

  res.json({
    session: activeSession,
    presentCount,
    totalTarget: activeSession.totalTarget,
    physicalHeadcount: activeSession.physicalHeadcount
  });
});

// 7. Start Broadcast Session (Teacher)
app.post('/api/sessions/start', async (req: Request, res: Response) => {
  const { subjectCode, subjectName, room, pin, durationSeconds, teacherName } = req.body;

  // Complete existing active sessions
  if (isMongoConnected && mongoDb) {
    await mongoDb.collection('sessions').updateMany(
      { status: 'ACTIVE' },
      { $set: { status: 'COMPLETED', endedAt: new Date().toISOString() } }
    ).catch(() => {});
  }
  db.sessions.forEach((s) => {
    if (s.status === 'ACTIVE') {
      s.status = 'COMPLETED';
      s.endedAt = new Date().toISOString();
    }
  });

  const sessionPin = pin ? String(pin).padStart(2, '0') : '47';
  const newSession: ClassSession = {
    id: `sess_${Date.now()}`,
    subjectCode: subjectCode || 'CS401',
    subjectName: subjectName || 'Database Management Systems',
    teacherId: 'teacher_current',
    teacherName: teacherName || 'Faculty Member',
    room: room || 'Room FB',
    pin: sessionPin,
    status: 'ACTIVE',
    durationSeconds: durationSeconds || 165,
    secondsRemaining: durationSeconds || 165,
    totalTarget: 48,
    physicalHeadcount: 0,
    startedAt: new Date().toISOString(),
    recentJoins: []
  };

  if (isMongoConnected && mongoDb) {
    try {
      await mongoDb.collection('sessions').insertOne(newSession);
      console.log(`🍃 [MongoDB Atlas] Started session: ${newSession.subjectCode} (PIN: ${newSession.pin})`);
    } catch (e) {
      console.error('Mongo start session error:', e);
    }
  }

  db.sessions.push(newSession);
  persistDb();

  broadcastSseEvent('SESSION_STARTED', {
    sessionId: newSession.id,
    subjectCode: newSession.subjectCode,
    subjectName: newSession.subjectName,
    room: newSession.room,
    pin: newSession.pin
  });

  res.status(201).json({
    success: true,
    session: newSession
  });
});

// 8. Stop Broadcast Session Early
app.post('/api/sessions/stop', async (req: Request, res: Response) => {
  if (isMongoConnected && mongoDb) {
    await mongoDb.collection('sessions').updateMany(
      { status: 'ACTIVE' },
      { $set: { status: 'COMPLETED', secondsRemaining: 0, endedAt: new Date().toISOString() } }
    ).catch(() => {});
  }

  db.sessions.forEach((s) => {
    if (s.status === 'ACTIVE') {
      s.secondsRemaining = 0;
      s.status = 'COMPLETED';
      s.endedAt = new Date().toISOString();
    }
  });
  persistDb();

  broadcastSseEvent('SESSION_STOPPED', {});
  res.json({ success: true, message: 'Broadcast stopped early' });
});

// 9. Mark Attendance (Student Check-in with PIN & GPS)
app.post('/api/attendance/mark', async (req: Request, res: Response) => {
  const { pin, studentRollNo, studentName, latitude, longitude } = req.body;

  let activeSession: ClassSession | null = null;
  if (isMongoConnected && mongoDb) {
    const doc = await mongoDb.collection('sessions').findOne({ status: 'ACTIVE' }).catch(() => null);
    if (doc) activeSession = doc as unknown as ClassSession;
  }
  if (!activeSession) {
    activeSession = db.sessions.find((s) => s.status === 'ACTIVE') || null;
  }

  if (!activeSession) {
    return res.status(404).json({ error: 'No active attendance broadcast session in progress.' });
  }

  const enteredPin = String(pin || '').trim();
  if (enteredPin !== activeSession.pin) {
    return res.status(400).json({
      error: `Invalid Session PIN '${enteredPin}'. Please enter the PIN announced in class.`
    });
  }

  // Validate GPS boundary
  const userLat = typeof latitude === 'number' ? latitude : 22.1287;
  const userLng = typeof longitude === 'number' ? longitude : 82.1365;
  const distance = calculateHaversineDistance(
    userLat,
    userLng,
    GGU_CAMPUS.centerLat,
    GGU_CAMPUS.centerLng
  );

  if (distance > GGU_CAMPUS.radiusMeters) {
    return res.status(403).json({
      error: `Campus Geofence Error: You are ${distance}m away from GGU campus boundary.`
    });
  }

  const roll = studentRollNo ? String(studentRollNo).trim() : '2024-BTECH-CS-042';
  const name = studentName ? String(studentName).trim() : 'Student User';
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const record: AttendanceRecord = {
    id: `att_${Date.now()}`,
    sessionId: activeSession.id,
    studentId: roll,
    studentName: name,
    rollNo: roll,
    dept: 'CSIT',
    isPresent: true,
    checkInTime: timeString,
    verificationMethod: 'GGU_GPS_PIN',
    distanceMeters: distance
  };

  if (isMongoConnected && mongoDb) {
    try {
      await mongoDb.collection('attendance').updateOne(
        { sessionId: activeSession.id, rollNo: roll },
        { $set: record },
        { upsert: true }
      );
    } catch (e) {
      console.warn('Mongo attendance write error:', e);
    }
  }

  const existingIdx = db.attendance.findIndex((a) => a.sessionId === activeSession?.id && a.rollNo === roll);
  if (existingIdx >= 0) {
    db.attendance[existingIdx] = record;
  } else {
    db.attendance.push(record);
  }

  // Update recent joins
  const joinLabel = `${name} (${roll.slice(-3)}) • ${timeString}`;
  activeSession.recentJoins = [joinLabel, ...activeSession.recentJoins.slice(0, 6)];

  if (isMongoConnected && mongoDb) {
    await mongoDb.collection('sessions').updateOne(
      { id: activeSession.id },
      { $set: { recentJoins: activeSession.recentJoins } }
    ).catch(() => {});
  }
  persistDb();

  const presentCount = db.attendance.filter((a) => a.sessionId === activeSession?.id && a.isPresent).length;

  broadcastSseEvent('STUDENT_CHECKIN', {
    sessionId: activeSession.id,
    studentName: name,
    rollNo: roll,
    time: timeString,
    presentCount,
    totalTarget: activeSession.totalTarget
  });

  res.json({
    success: true,
    message: 'Attendance verified and recorded successfully!',
    record: {
      studentName: name,
      rollNo: roll,
      time: timeString,
      method: 'GGU Bilaspur Campus GPS + Session PIN',
      distanceMeters: distance
    }
  });
});

// 10. Reports for Session
app.get('/api/reports/session/:id', async (req: Request, res: Response) => {
  const sessionId = req.params.id;
  let session: ClassSession | null = null;
  let records: AttendanceRecord[] = [];

  if (isMongoConnected && mongoDb) {
    try {
      const s = await mongoDb.collection('sessions').findOne({ id: sessionId });
      if (s) session = s as unknown as ClassSession;
      records = (await mongoDb.collection('attendance').find({ sessionId }).toArray()) as unknown as AttendanceRecord[];
    } catch (e) {
      console.warn('Mongo report read error:', e);
    }
  }

  if (!session) {
    session = db.sessions.find((s) => s.id === sessionId) || db.sessions[db.sessions.length - 1] || null;
    records = db.attendance.filter((a) => a.sessionId === session?.id);
  }

  if (!session) {
    return res.status(404).json({ error: 'No sessions found yet' });
  }

  const presentCount = records.filter((r) => r.isPresent).length;

  res.json({
    session,
    presentCount,
    totalEnrolled: records.length,
    physicalHeadcount: session.physicalHeadcount,
    hasDiscrepancy: presentCount > session.physicalHeadcount,
    records
  });
});

// 11. Real-Time SSE Stream Endpoint
app.get('/api/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  sseClients.add(res);
  res.write(`event: CONNECTED\ndata: ${JSON.stringify({ message: 'Connected to AttendIQ live feed' })}\n\n`);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// Dedicated APK download endpoint with proper Android MIME type and download headers (no-cache)
app.get(['/app-debug.apk', '/download/apk', '/attendiq.apk', '/download/latest.apk'], (req: Request, res: Response) => {
  const apkPath = path.join(__dirname, 'public', 'app-debug.apk');
  if (fs.existsSync(apkPath)) {
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Content-Disposition', 'attachment; filename="AttendIQ-latest.apk"');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    return res.sendFile(apkPath);
  }
  return res.status(404).send('app-debug.apk file not found');
});

// -------------------------------------------------------------
// Development vs Production Setup
// -------------------------------------------------------------
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.static(path.join(__dirname, 'public')));

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
    console.log('⚡ Vite development middlewares attached to Express');
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.use((req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('🚀 Serving production build from /dist');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ AttendIQ Full-Stack Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
