export type Role = 'STUDENT' | 'TEACHER';

export type AuthTab = 'LOGIN' | 'REGISTER';

export type Screen =
  | 'ROLE_SELECTION'
  | 'AUTH'
  | 'DOC_VERIFICATION'
  | 'REGISTRATION_SUCCESS'
  | 'TEACHER_BROADCAST_SETUP'
  | 'TEACHER_BROADCAST_ACTIVE'
  | 'STUDENT_ATTENDANCE'
  | 'TEACHER_REPORT';

export interface SubjectRosterItem {
  sNo: string;
  code: string;
  type: string; // Major, Minor, SEC, VAC, AEC
  subjectName: string;
  offeringDept?: string;
  credits?: number;
}

export interface TeacherClassSession {
  sNo: string;
  subjectCode: string;
  subjectName: string;
  allotTime: string;
  room?: string;
  offeringDept?: string;
  courseType?: string;
  isPg?: boolean;
}

export interface StudentAttendanceRecord {
  sNo: string;
  studentName: string;
  dept: string;
  courseType?: string;
  isPresent: boolean;
  checkInTime?: string;
  verificationMethod?: string;
}

export interface CampusGeofence {
  campusName: string;
  locationName: string;
  centerLat: number;
  centerLng: number;
  radiusMeters: number;
  currentDistanceMeters: number;
  isWithinBoundary: boolean;
}

export interface EnrolledCourseItem {
  code: string;
  subjectName: string;
  type: string; // Major, Minor, SEC, VAC, AEC
  credits: number;
  offeringDept?: string;
}

export interface TeacherTeachingScheduleItem {
  id: string;
  subjectCode: string;
  subjectName: string;
  courseType: string;
  allotTime: string;
  dayOfWeek?: string;
  room: string;
  offeringDept?: string;
}

export interface StudentParsedDocumentData {
  documentName: string;
  studentName: string;
  enrollmentNo: string;
  department: string;
  courseLevel: string; // UG or PG
  semester: string;
  enrolledCourses: EnrolledCourseItem[];
}

export interface TeacherIdCardData {
  documentName: string;
  facultyName: string;
  facultyId: string;
  department: string;
  designation?: string;
  previewUrl?: string;
}

export interface TeacherTimetableData {
  documentName: string;
  teachingSchedule: TeacherTeachingScheduleItem[];
  previewUrl?: string;
}

export interface TeacherParsedDocumentData {
  documentName: string;
  facultyName: string;
  facultyId: string;
  department: string;
  designation: string;
  teachingSchedule: TeacherTeachingScheduleItem[];
  idCardDoc?: TeacherIdCardData | null;
  timetableDoc?: TeacherTimetableData | null;
}

export interface AttendanceUiState {
  currentScreen: Screen;
  currentRole: Role;
  authTab: AuthTab;

  // Student Login
  studentEnrollment: string;
  studentPassword: string;

  // Teacher Login
  teacherFacultyId: string;
  teacherPassword: string;

  // Student Registration Step 1
  studentRegName: string;
  studentRegEnrollment: string;
  studentRegEmail: string;
  studentCourseLevel: string;
  studentDepartment: string;
  studentSemester: string;
  studentRegPassword: string;
  studentRegConfirmPassword: string;

  // Teacher Registration Step 1
  teacherRegName: string;
  teacherRegFacultyId: string;
  teacherRegEmail: string;
  teacherDepartment: string;
  teacherRegPassword: string;
  teacherRegConfirmPassword: string;

  // Document Verification & Extracted Data (Step 2)
  studentParsedDoc: StudentParsedDocumentData | null;
  teacherParsedDoc: TeacherParsedDocumentData | null;
  teacherIdCardDoc: TeacherIdCardData | null;
  teacherTimetableDoc: TeacherTimetableData | null;
  isParsingDocument: boolean;
  isParsingTeacherIdCard: boolean;
  isParsingTeacherTimetable: boolean;
  selectedBroadcastSessionCode: string;

  // Broadcast Setup PIN
  broadcastPin: string;

  // Broadcast Active Session
  isBroadcasting: boolean;
  broadcastSecondsLeft: number;
  currentAttendanceCount: number;
  totalAttendanceTarget: number;
  recentJoins: string[];

  // Student PIN Entry & Geofencing
  studentEnteredPin: string;
  studentAttendanceMarked: boolean;
  studentAttendanceMessage: string | null;
  campusGeofence: CampusGeofence;

  // Targeted Notification Alert for Student
  isIncomingSessionAlertVisible: boolean;
  incomingSubjectCode: string;
  incomingSubjectName: string;

  // Teacher Headcount Audit & Discrepancy Verification
  physicalHeadcount: number;
  isAuditModeActive: boolean;

  // Report
  reportCurrentPage: number;
  reportPageSize: number;
  searchQuery: string;
  selectedDeptFilter: string;
  selectedCategoryFilter: string;
  userNotification: string | null;

  // Modals / Sheets
  isProfileSheetOpen: boolean;
  isExportModalOpen: boolean;
  isDocPreviewOpen: boolean;
  isMongoDbInfoOpen: boolean;
  docPreviewTitle: string;
  docPreviewContent: string;
}
