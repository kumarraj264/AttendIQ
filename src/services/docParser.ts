import {
  StudentParsedDocumentData,
  TeacherParsedDocumentData,
  TeacherIdCardData,
  TeacherTimetableData,
  EnrolledCourseItem,
  TeacherTeachingScheduleItem
} from '../types';

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const b64 = result.split(',')[1] || result;
      resolve(b64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const DocParserService = {
  // Parse student course selection slip
  async parseStudentCourseSlip(
    file: File | null,
    fallbackName?: string,
    fallbackRoll?: string
  ): Promise<StudentParsedDocumentData> {
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        const res = await fetch('/api/documents/parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileBase64: base64,
            mimeType: file.type,
            fileName: file.name,
            role: 'STUDENT',
            fallbackName,
            fallbackRoll
          })
        });
        const data = await res.json();
        if (data.success && data.data) {
          return {
            documentName: file.name,
            studentName: data.data.studentName || fallbackName || '',
            enrollmentNo: data.data.enrollmentNo || fallbackRoll || '',
            department: data.data.department || 'CSIT',
            semester: data.data.semester || '4th Semester',
            courseLevel: data.data.courseLevel || 'UG',
            enrolledCourses: data.data.enrolledCourses || []
          };
        } else {
          throw new Error(data.error || 'Server could not parse document');
        }
      } catch (err: any) {
        console.error('Remote document parse error:', err);
        throw err;
      }
    }

    // Default sample slip data (when "Use Sample Slip" is clicked)
    const defaultCourses: EnrolledCourseItem[] = [
      {
        code: 'CS401',
        subjectName: 'Database Management Systems',
        type: 'Major',
        credits: 4,
        offeringDept: 'CSIT'
      },
      {
        code: 'CS405',
        subjectName: 'Operating Systems Lab',
        type: 'Minor',
        credits: 3,
        offeringDept: 'CSE'
      },
      {
        code: 'SEC201',
        subjectName: 'Web & Android Development',
        type: 'SEC',
        credits: 3,
        offeringDept: 'CSIT'
      },
      {
        code: 'AEC101',
        subjectName: 'Technical Communication & Ethics',
        type: 'AEC',
        credits: 2,
        offeringDept: 'Humanities'
      },
      {
        code: 'VAC102',
        subjectName: 'Environmental Studies & Science',
        type: 'VAC',
        credits: 2,
        offeringDept: 'Env Sciences'
      }
    ];

    return {
      documentName: 'GGU_Course_Selection_Slip.pdf',
      studentName: fallbackName?.trim() || 'Alex Morgan',
      enrollmentNo: fallbackRoll?.trim() || '2024-BTECH-CS-042',
      department: 'CSIT',
      courseLevel: 'UG',
      semester: '4th Semester',
      enrolledCourses: defaultCourses
    };
  },

  // Parse Teacher Faculty ID card specifically
  async parseTeacherIdCard(
    file: File | null,
    fallbackName?: string,
    fallbackId?: string
  ): Promise<TeacherIdCardData> {
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        const res = await fetch('/api/documents/parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileBase64: base64,
            mimeType: file.type,
            fileName: file.name,
            role: 'TEACHER',
            category: 'ID_CARD',
            fallbackName,
            fallbackId
          })
        });
        const data = await res.json();
        if (data.success && data.data) {
          return {
            documentName: file.name,
            facultyName: data.data.facultyName || fallbackName || 'Dr. Eleanor Vance',
            facultyId: data.data.facultyId || fallbackId || 'FAC-CS-8924',
            department: data.data.department || 'Computer Science & Engineering',
            designation: data.data.designation || 'Associate Professor'
          };
        } else {
          throw new Error(data.error || 'Server could not parse faculty ID card');
        }
      } catch (err: any) {
        console.error('Remote ID card parse error:', err);
        throw err;
      }
    }

    return {
      documentName: 'GGV_Faculty_ID_Card.png',
      facultyName: fallbackName?.trim() || 'Dr. Eleanor Vance',
      facultyId: fallbackId?.trim() || 'FAC-CS-8924',
      department: 'Computer Science & Engineering',
      designation: 'Associate Professor'
    };
  },

  // Parse teacher timetable schedule
  async parseTeacherTimeTable(
    file: File | null,
    fallbackName?: string,
    fallbackId?: string
  ): Promise<TeacherParsedDocumentData> {
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        const res = await fetch('/api/documents/parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileBase64: base64,
            mimeType: file.type,
            fileName: file.name,
            role: 'TEACHER',
            category: 'TIMETABLE',
            fallbackName,
            fallbackId
          })
        });
        const data = await res.json();
        if (data.success && data.data) {
          return {
            documentName: file.name,
            facultyName: data.data.facultyName || fallbackName || '',
            facultyId: data.data.facultyId || fallbackId || '',
            department: data.data.department || 'Computer Science & Engineering',
            designation: data.data.designation || 'Associate Professor',
            teachingSchedule: data.data.teachingSchedule || []
          };
        } else {
          throw new Error(data.error || 'Server could not parse timetable document');
        }
      } catch (err: any) {
        console.error('Remote timetable parse error:', err);
        throw err;
      }
    }

    const defaultSchedule: TeacherTeachingScheduleItem[] = [
      {
        id: 'sched_1',
        subjectCode: 'CS401',
        subjectName: 'Database Management Systems',
        courseType: 'Major',
        allotTime: '10:15 AM - 11:15 AM',
        dayOfWeek: 'Mon, Wed, Fri',
        room: 'Room FB',
        offeringDept: 'CSIT'
      },
      {
        id: 'sched_2',
        subjectCode: 'CS405',
        subjectName: 'Operating Systems Lab',
        courseType: 'Minor',
        allotTime: '12:15 PM - 02:15 PM',
        dayOfWeek: 'Tuesday',
        room: 'CSE Lab 2',
        offeringDept: 'CSE'
      },
      {
        id: 'sched_3',
        subjectCode: 'SEC201',
        subjectName: 'Web & Android Development',
        courseType: 'SEC',
        allotTime: '11:30 AM - 12:30 PM',
        dayOfWeek: 'Thursday',
        room: 'Room 104',
        offeringDept: 'CSIT'
      }
    ];

    return {
      documentName: 'Faculty_TimeTable.pdf',
      facultyName: fallbackName?.trim() || 'Dr. Eleanor Vance',
      facultyId: fallbackId?.trim() || 'FAC-CS-8924',
      department: 'Computer Science & Engineering',
      designation: 'Associate Professor',
      teachingSchedule: defaultSchedule
    };
  },

  // Helper to extract strictly timetable schedule data
  async parseTeacherTimetableData(
    file: File | null,
    fallbackName?: string,
    fallbackId?: string
  ): Promise<TeacherTimetableData> {
    const fullDoc = await this.parseTeacherTimeTable(file, fallbackName, fallbackId);
    return {
      documentName: fullDoc.documentName,
      teachingSchedule: fullDoc.teachingSchedule
    };
  }
};
