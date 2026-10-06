import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  Role,
  AuthTab,
  Screen,
  SubjectRosterItem,
  TeacherClassSession,
  StudentAttendanceRecord,
  AttendanceUiState,
  StudentParsedDocumentData,
  TeacherParsedDocumentData,
  EnrolledCourseItem,
  TeacherTeachingScheduleItem
} from '../types';
import { ApiService } from '../services/api';
import { DocParserService } from '../services/docParser';
import { triggerHaptic } from '../utils/haptic';

export const initialStudentRoster: SubjectRosterItem[] = [
  { sNo: '01', code: 'CS401', type: 'Major', subjectName: 'Database Management Systems', offeringDept: 'CSIT', credits: 4 },
  { sNo: '02', code: 'CS405', type: 'Minor', subjectName: 'Operating Systems Lab', offeringDept: 'CSE', credits: 3 },
  { sNo: '03', code: 'SEC201', type: 'SEC', subjectName: 'Web & Android Development', offeringDept: 'CSIT', credits: 3 },
  { sNo: '04', code: 'AEC101', type: 'AEC', subjectName: 'Technical Communication', offeringDept: 'English Dept', credits: 2 },
  { sNo: '05', code: 'VAC102', type: 'VAC', subjectName: 'Environmental Studies & Ethics', offeringDept: 'Env Sciences', credits: 2 }
];

export const initialUgSessions: TeacherClassSession[] = [
  { sNo: '1', subjectCode: 'CS401', subjectName: 'Database Management Systems', allotTime: '10:15 AM', offeringDept: 'CSIT', courseType: 'Major' },
  { sNo: '2', subjectCode: 'CS405', subjectName: 'Operating Systems Lab', allotTime: '12:15 PM', offeringDept: 'CSE', courseType: 'Minor' },
  { sNo: '3', subjectCode: 'SEC201', subjectName: 'Web & Android Development', allotTime: '11:30 AM', offeringDept: 'CSIT', courseType: 'SEC' }
];

export const initialPgSessions: TeacherClassSession[] = [
  { sNo: '1', subjectCode: 'CS701', subjectName: 'Advanced Distributed Systems', allotTime: '09:15 AM', offeringDept: 'CSIT', courseType: 'Major', isPg: true },
  { sNo: '2', subjectCode: 'CS702', subjectName: 'Machine Learning Seminar', allotTime: '03:15 PM', offeringDept: 'CSIT', courseType: 'Major', isPg: true }
];

const initialAttendanceRecords: StudentAttendanceRecord[] = [
  { sNo: '01', studentName: 'Santosh Rao', dept: 'CSIT', courseType: 'Major', isPresent: true },
  { sNo: '02', studentName: 'Alex Morgan', dept: 'CSE', courseType: 'Minor', isPresent: true },
  { sNo: '03', studentName: 'Priya Sharma', dept: 'ECE', courseType: 'SEC', isPresent: true },
  { sNo: '04', studentName: 'Rahul Verma', dept: 'CSIT', courseType: 'Major', isPresent: true },
  { sNo: '05', studentName: 'Ananya Patel', dept: 'IT', courseType: 'VAC', isPresent: true },
  { sNo: '06', studentName: 'Kevin Chen', dept: 'CSIT', courseType: 'Major', isPresent: true },
  { sNo: '07', studentName: 'Sarah Jenkins', dept: 'CSE', courseType: 'Minor', isPresent: true },
  { sNo: '08', studentName: 'David O\'Connor', dept: 'CSIT', courseType: 'Major', isPresent: true },
  { sNo: '09', studentName: 'Aarav Gupta', dept: 'CSE', courseType: 'Minor', isPresent: true },
  { sNo: '10', studentName: 'Meera Nair', dept: 'CSIT', courseType: 'Major', isPresent: true },
  { sNo: '11', studentName: 'Rohan Joshi', dept: 'ECE', courseType: 'SEC', isPresent: true },
  { sNo: '12', studentName: 'Sneha Kulkarni', dept: 'IT', courseType: 'AEC', isPresent: true },
  { sNo: '13', studentName: 'Ethan Taylor', dept: 'CSE', courseType: 'Minor', isPresent: false },
  { sNo: '14', studentName: 'Zoe Martinez', dept: 'CSIT', courseType: 'Major', isPresent: true },
  { sNo: '15', studentName: 'Vikram Malhotra', dept: 'CSE', courseType: 'Minor', isPresent: true },
  { sNo: '16', studentName: 'Divya Pillai', dept: 'ECE', courseType: 'SEC', isPresent: true }
];

interface AttendanceContextType {
  uiState: AttendanceUiState;
  sampleStudentRoster: SubjectRosterItem[];
  sampleUgSessions: TeacherClassSession[];
  samplePgSessions: TeacherClassSession[];
  attendanceRecords: StudentAttendanceRecord[];
  selectRole: (role: Role) => void;
  switchRole: () => void;
  setAuthTab: (tab: AuthTab) => void;
  navigateTo: (screen: Screen) => void;
  goBack: () => void;
  updateStudentEnrollment: (text: string) => void;
  updateStudentPassword: (text: string) => void;
  updateTeacherFacultyId: (text: string) => void;
  updateTeacherPassword: (text: string) => void;
  updateStudentRegName: (text: string) => void;
  updateStudentRegEnrollment: (text: string) => void;
  updateStudentRegEmail: (text: string) => void;
  updateStudentCourseLevel: (level: string) => void;
  updateStudentDepartment: (dept: string) => void;
  updateStudentSemester: (sem: string) => void;
  updateTeacherRegName: (text: string) => void;
  updateTeacherRegFacultyId: (text: string) => void;
  updateTeacherRegEmail: (text: string) => void;
  updateTeacherDepartment: (dept: string) => void;
  appendBroadcastPinDigit: (d: string) => void;
  backspaceBroadcastPin: () => void;
  clearBroadcastPin: () => void;
  appendStudentPinDigit: (d: string) => void;
  backspaceStudentPin: () => void;
  clearStudentPin: () => void;
  toggleCampusGeofence: () => void;
  triggerBroadcastSession: () => void;
  dismissIncomingAlert: () => void;
  acceptIncomingSessionAlert: () => void;
  submitStudentAttendance: () => void;
  resetStudentAttendance: () => void;
  startBroadcastTimer: () => void;
  stopBroadcastTimer: () => void;
  setPhysicalHeadcount: (count: number) => void;
  toggleAuditMode: () => void;
  cancelStudentAttendance: (sNo: string) => void;
  confirmStudentAttendance: (sNo: string) => void;
  toggleStudentAttendance: (sNo: string) => void;
  setSearchQuery: (query: string) => void;
  setDeptFilter: (dept: string) => void;
  setCategoryFilter: (category: string) => void;
  getFilteredAttendanceRecords: () => StudentAttendanceRecord[];
  openProfileSheet: () => void;
  closeProfileSheet: () => void;
  openExportModal: () => void;
  closeExportModal: () => void;
  openMongoDbInfo: () => void;
  closeMongoDbInfo: () => void;
  openDocPreview: (title: string, content: string) => void;
  closeDocPreview: () => void;
  dismissNotification: () => void;
  exportCsv: () => void;
  saveAndPublish: () => void;
  prevReportPage: () => void;
  nextReportPage: () => void;
  parseStudentCourseSlip: (file: File | null) => Promise<void>;
  parseTeacherIdCard: (file: File | null) => Promise<void>;
  parseTeacherTimeTable: (file: File | null) => Promise<void>;
  updateStudentParsedData: (data: Partial<StudentParsedDocumentData>) => void;
  updateStudentCourseItem: (index: number, updated: Partial<EnrolledCourseItem>) => void;
  addStudentCourseItem: (course: EnrolledCourseItem) => void;
  removeStudentCourseItem: (index: number) => void;
  updateTeacherParsedData: (data: Partial<TeacherParsedDocumentData>) => void;
  updateTeacherScheduleItem: (index: number, updated: Partial<TeacherTeachingScheduleItem>) => void;
  addTeacherScheduleItem: (item: TeacherTeachingScheduleItem) => void;
  removeTeacherScheduleItem: (index: number) => void;
  finalizeRegistration: () => Promise<boolean>;
  setSelectedBroadcastSessionCode: (code: string) => void;
}

const AttendanceContext = createContext<AttendanceContextType | null>(null);

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [uiState, setUiState] = useState<AttendanceUiState>({
    currentScreen: 'ROLE_SELECTION',
    currentRole: 'TEACHER',
    authTab: 'LOGIN',

    studentEnrollment: '',
    studentPassword: '',

    teacherFacultyId: '',
    teacherPassword: '',

    studentRegName: '',
    studentRegEnrollment: '',
    studentRegEmail: '',
    studentCourseLevel: 'UG',
    studentDepartment: 'CSIT',
    studentSemester: '',
    studentRegPassword: '',
    studentRegConfirmPassword: '',

    teacherRegName: '',
    teacherRegFacultyId: '',
    teacherRegEmail: '',
    teacherDepartment: 'Computer Science & Engineering',
    teacherRegPassword: '',
    teacherRegConfirmPassword: '',

    studentParsedDoc: null,
    teacherParsedDoc: null,
    teacherIdCardDoc: null,
    teacherTimetableDoc: null,
    isParsingDocument: false,
    isParsingTeacherIdCard: false,
    isParsingTeacherTimetable: false,
    selectedBroadcastSessionCode: 'CS401',

    broadcastPin: '',

    isBroadcasting: false,
    broadcastSecondsLeft: 165,
    currentAttendanceCount: 0,
    totalAttendanceTarget: 48,
    recentJoins: [],

    studentEnteredPin: '',
    studentAttendanceMarked: false,
    studentAttendanceMessage: null,
    campusGeofence: {
      campusName: 'Guru Ghasidas Vishwavidyalaya (GGU)',
      locationName: 'Koni, Bilaspur, Chhattisgarh',
      centerLat: 22.1293,
      centerLng: 82.1360,
      radiusMeters: 1500.0,
      currentDistanceMeters: 320.0,
      isWithinBoundary: true
    },

    isIncomingSessionAlertVisible: false,
    incomingSubjectCode: 'CS401',
    incomingSubjectName: 'Database Management Systems',

    physicalHeadcount: 14,
    isAuditModeActive: false,

    reportCurrentPage: 0,
    reportPageSize: 8,
    searchQuery: '',
    selectedDeptFilter: 'All',
    selectedCategoryFilter: 'All',
    userNotification: null,

    isProfileSheetOpen: false,
    isExportModalOpen: false,
    isDocPreviewOpen: false,
    isMongoDbInfoOpen: false,
    docPreviewTitle: 'Document Preview',
    docPreviewContent: ''
  });

  const [attendanceRecords, setAttendanceRecords] = useState<StudentAttendanceRecord[]>(initialAttendanceRecords);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nameIndexRef = useRef(0);

  const simulateNames = [
    'Sneha Kulkarni (IT) • Just now',
    'Divya Pillai (ECE) • Just now',
    'Aarav Gupta (CSE) • Just now',
    'Rohan Joshi (ECE) • Just now',
    'Zoe Martinez (CSIT) • Just now'
  ];

  const stopBroadcastTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setUiState(prev => ({ ...prev, isBroadcasting: false }));
  }, []);

  const startBroadcastTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    nameIndexRef.current = 0;
    setUiState(prev => ({
      ...prev,
      isBroadcasting: true,
      broadcastSecondsLeft: 165,
      currentAttendanceCount: 24,
      isIncomingSessionAlertVisible: true
    }));

    timerRef.current = setInterval(() => {
      setUiState(prev => {
        if (prev.broadcastSecondsLeft <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return { ...prev, broadcastSecondsLeft: 0, isBroadcasting: false };
        }
        const newSeconds = prev.broadcastSecondsLeft - 1;
        const shouldIncrement = newSeconds % 5 === 0 && prev.currentAttendanceCount < 40;
        const newCount = shouldIncrement ? prev.currentAttendanceCount + 1 : prev.currentAttendanceCount;

        let updatedJoins = prev.recentJoins;
        if (shouldIncrement && nameIndexRef.current < simulateNames.length) {
          const nextName = simulateNames[nameIndexRef.current++];
          updatedJoins = [nextName, ...prev.recentJoins.slice(0, 3)];
        }

        return {
          ...prev,
          broadcastSecondsLeft: newSeconds,
          currentAttendanceCount: newCount,
          recentJoins: updatedJoins
        };
      });
    }, 1000);
  }, []);

  useEffect(() => {
    // 1. Check GGU Bilaspur Campus GPS Geofence from backend
    ApiService.verifyGeofence().then((res) => {
      setUiState((prev) => ({
        ...prev,
        campusGeofence: {
          campusName: res.campusName,
          locationName: res.locationName,
          centerLat: res.centerLat,
          centerLng: res.centerLng,
          radiusMeters: res.radiusMeters,
          currentDistanceMeters: res.currentDistanceMeters,
          isWithinBoundary: res.isWithinBoundary
        }
      }));
    });

    // 2. Fetch initial active session from backend
    ApiService.getActiveSession().then((res) => {
      if (res && res.session) {
        setUiState((prev) => ({
          ...prev,
          broadcastPin: res.session.pin,
          currentAttendanceCount: res.presentCount,
          totalAttendanceTarget: res.totalTarget,
          physicalHeadcount: res.physicalHeadcount,
          recentJoins: res.session.recentJoins?.length ? res.session.recentJoins : prev.recentJoins
        }));
      }
    });

    // 3. Connect real-time Server-Sent Events (SSE)
    const unsubscribe = ApiService.subscribeToLiveEvents((type, data) => {
      if (type === 'STUDENT_CHECKIN') {
        setUiState((prev) => ({
          ...prev,
          currentAttendanceCount: data.presentCount,
          recentJoins: [
            `${data.studentName} (${data.rollNo.slice(-3)}) • ${data.time}`,
            ...prev.recentJoins.slice(0, 5)
          ]
        }));
        setAttendanceRecords((prev) =>
          prev.map((rec) =>
            rec.studentName.toLowerCase() === data.studentName.toLowerCase()
              ? { ...rec, isPresent: true, checkInTime: data.time }
              : rec
          )
        );
      } else if (type === 'SESSION_STARTED') {
        setUiState((prev) => ({
          ...prev,
          broadcastPin: data.pin,
          incomingSubjectCode: data.subjectCode,
          incomingSubjectName: data.subjectName,
          isIncomingSessionAlertVisible: true
        }));
      }
    });

    return () => {
      unsubscribe();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const selectRole = (role: Role) => {
    triggerHaptic('medium');
    setUiState(prev => ({
      ...prev,
      currentRole: role,
      currentScreen: 'AUTH',
      authTab: 'LOGIN'
    }));
  };

  const switchRole = () => {
    triggerHaptic('medium');
    setUiState(prev => ({
      ...prev,
      currentRole: prev.currentRole === 'TEACHER' ? 'STUDENT' : 'TEACHER'
    }));
  };

  const setAuthTab = (tab: AuthTab) => {
    triggerHaptic('light');
    setUiState(prev => ({ ...prev, authTab: tab }));
  };

  const navigateTo = (screen: Screen) => {
    triggerHaptic('medium');
    if (screen === 'TEACHER_BROADCAST_ACTIVE') {
      startBroadcastTimer();
    } else {
      stopBroadcastTimer();
    }
    setUiState(prev => ({ ...prev, currentScreen: screen }));
  };

  const goBack = () => {
    triggerHaptic('medium');
    let next: Screen = 'ROLE_SELECTION';
    switch (uiState.currentScreen) {
      case 'ROLE_SELECTION':
        next = 'ROLE_SELECTION';
        break;
      case 'AUTH':
        next = 'ROLE_SELECTION';
        break;
      case 'DOC_VERIFICATION':
        next = 'AUTH';
        break;
      case 'REGISTRATION_SUCCESS':
        next = 'AUTH';
        break;
      case 'TEACHER_BROADCAST_SETUP':
        next = 'AUTH';
        break;
      case 'TEACHER_BROADCAST_ACTIVE':
        next = 'TEACHER_BROADCAST_SETUP';
        break;
      case 'STUDENT_ATTENDANCE':
        next = 'AUTH';
        break;
      case 'TEACHER_REPORT':
        next = 'TEACHER_BROADCAST_SETUP';
        break;
    }
    stopBroadcastTimer();
    setUiState(prev => ({ ...prev, currentScreen: next }));
  };

  const updateStudentEnrollment = (text: string) => setUiState(prev => ({ ...prev, studentEnrollment: text }));
  const updateStudentPassword = (text: string) => setUiState(prev => ({ ...prev, studentPassword: text }));
  const updateTeacherFacultyId = (text: string) => setUiState(prev => ({ ...prev, teacherFacultyId: text }));
  const updateTeacherPassword = (text: string) => setUiState(prev => ({ ...prev, teacherPassword: text }));

  const updateStudentRegName = (text: string) => setUiState(prev => ({ ...prev, studentRegName: text }));
  const updateStudentRegEnrollment = (text: string) => setUiState(prev => ({ ...prev, studentRegEnrollment: text }));
  const updateStudentRegEmail = (text: string) => setUiState(prev => ({ ...prev, studentRegEmail: text }));
  const updateStudentCourseLevel = (level: string) => setUiState(prev => ({ ...prev, studentCourseLevel: level }));
  const updateStudentDepartment = (dept: string) => setUiState(prev => ({ ...prev, studentDepartment: dept }));
  const updateStudentSemester = (sem: string) => setUiState(prev => ({ ...prev, studentSemester: sem }));

  const updateTeacherRegName = (text: string) => setUiState(prev => ({ ...prev, teacherRegName: text }));
  const updateTeacherRegFacultyId = (text: string) => setUiState(prev => ({ ...prev, teacherRegFacultyId: text }));
  const updateTeacherRegEmail = (text: string) => setUiState(prev => ({ ...prev, teacherRegEmail: text }));
  const updateTeacherDepartment = (dept: string) => setUiState(prev => ({ ...prev, teacherDepartment: dept }));

  const appendBroadcastPinDigit = (d: string) => {
    if (uiState.broadcastPin.length < 2) {
      setUiState(prev => ({ ...prev, broadcastPin: prev.broadcastPin + d }));
    }
  };

  const backspaceBroadcastPin = () => {
    setUiState(prev => ({ ...prev, broadcastPin: prev.broadcastPin.slice(0, -1) }));
  };

  const clearBroadcastPin = () => {
    setUiState(prev => ({ ...prev, broadcastPin: '' }));
  };

  const appendStudentPinDigit = (d: string) => {
    if (uiState.studentEnteredPin.length < 2) {
      setUiState(prev => ({
        ...prev,
        studentEnteredPin: prev.studentEnteredPin + d,
        studentAttendanceMessage: null
      }));
    }
  };

  const backspaceStudentPin = () => {
    setUiState(prev => ({
      ...prev,
      studentEnteredPin: prev.studentEnteredPin.slice(0, -1),
      studentAttendanceMessage: null
    }));
  };

  const clearStudentPin = () => {
    setUiState(prev => ({
      ...prev,
      studentEnteredPin: '',
      studentAttendanceMessage: null
    }));
  };

  const toggleCampusGeofence = () => {
    triggerHaptic('medium');
    setUiState(prev => {
      const toggled = !prev.campusGeofence.isWithinBoundary;
      return {
        ...prev,
        campusGeofence: {
          ...prev.campusGeofence,
          isWithinBoundary: toggled,
          currentDistanceMeters: toggled ? 340.0 : 2400.0
        },
        userNotification: toggled
          ? 'Simulated: Inside GGU Bilaspur Campus (340m from Central Library)'
          : 'Simulated: Outside GGU Campus (2.4 km away - Blocked)'
      };
    });
  };

  const triggerBroadcastSession = () => {
    triggerHaptic('medium');
    setUiState(prev => ({ ...prev, isIncomingSessionAlertVisible: true }));
  };

  const dismissIncomingAlert = () => {
    triggerHaptic('light');
    setUiState(prev => ({ ...prev, isIncomingSessionAlertVisible: false }));
  };

  const acceptIncomingSessionAlert = () => {
    triggerHaptic('heavy');
    setUiState(prev => ({
      ...prev,
      isIncomingSessionAlertVisible: false,
      currentRole: 'STUDENT',
      currentScreen: 'STUDENT_ATTENDANCE'
    }));
  };

  const submitStudentAttendance = async () => {
    const entered = uiState.studentEnteredPin;
    const validPin = uiState.broadcastPin || '47';

    if (!uiState.campusGeofence.isWithinBoundary) {
      triggerHaptic('error');
      setUiState(prev => ({
        ...prev,
        studentAttendanceMessage: `❌ Access Denied: You are outside GGU Bilaspur campus boundary (${prev.campusGeofence.currentDistanceMeters | 0}m away). You must be on-campus.`
      }));
      return;
    }

    if (entered.length < 2) {
      triggerHaptic('warning');
      setUiState(prev => ({
        ...prev,
        studentAttendanceMessage: 'Please enter the 2-digit Session PIN announced by the teacher.'
      }));
      return;
    }

    // Call real backend API
    const response = await ApiService.markAttendance({
      pin: entered,
      studentRollNo: '2024-BTECH-CS-042',
      studentName: 'Alex Morgan'
    });

    if (response.success) {
      triggerHaptic('success');
      setUiState(prev => ({
        ...prev,
        studentAttendanceMarked: true,
        studentAttendanceMessage: '✅ Attendance Verified: GGU Geofence + Session PIN Authenticated!'
      }));
    } else {
      triggerHaptic('error');
      setUiState(prev => ({
        ...prev,
        studentAttendanceMessage: response.message || `Invalid PIN. Active Session PIN is ${validPin}`
      }));
    }
  };

  const resetStudentAttendance = () => {
    triggerHaptic('medium');
    setUiState(prev => ({
      ...prev,
      studentEnteredPin: '',
      studentAttendanceMarked: false,
      studentAttendanceMessage: null
    }));
  };

  const setPhysicalHeadcount = (count: number) => {
    setUiState(prev => ({ ...prev, physicalHeadcount: count }));
  };

  const toggleAuditMode = () => {
    setUiState(prev => ({ ...prev, isAuditModeActive: !prev.isAuditModeActive }));
  };

  const cancelStudentAttendance = (sNo: string) => {
    const student = attendanceRecords.find(it => it.sNo === sNo);
    setAttendanceRecords(prev => prev.map(it => (it.sNo === sNo ? { ...it, isPresent: false } : it)));
    setUiState(prev => ({
      ...prev,
      userNotification: `Attendance CANCELLED for ${student?.studentName || 'Student'} (Marked Absent)`
    }));
  };

  const confirmStudentAttendance = (sNo: string) => {
    const student = attendanceRecords.find(it => it.sNo === sNo);
    setAttendanceRecords(prev => prev.map(it => (it.sNo === sNo ? { ...it, isPresent: true } : it)));
    setUiState(prev => ({
      ...prev,
      userNotification: `Attendance CONFIRMED for ${student?.studentName || 'Student'} (Present)`
    }));
  };

  const toggleStudentAttendance = (sNo: string) => {
    const student = attendanceRecords.find(it => it.sNo === sNo);
    setAttendanceRecords(prev => {
      const next = prev.map(it => (it.sNo === sNo ? { ...it, isPresent: !it.isPresent } : it));
      const newStatus = next.find(it => it.sNo === sNo)?.isPresent;
      setUiState(u => ({
        ...u,
        userNotification: newStatus ? `${student?.studentName} marked Present` : `${student?.studentName} marked Absent`
      }));
      return next;
    });
  };

  const setSearchQuery = (query: string) => {
    setUiState(prev => ({ ...prev, searchQuery: query, reportCurrentPage: 0 }));
  };

  const setDeptFilter = (dept: string) => {
    setUiState(prev => ({ ...prev, selectedDeptFilter: dept, reportCurrentPage: 0 }));
  };

  const setCategoryFilter = (category: string) => {
    setUiState(prev => ({ ...prev, selectedCategoryFilter: category, reportCurrentPage: 0 }));
  };

  const getFilteredAttendanceRecords = useCallback(() => {
    const q = uiState.searchQuery.trim().toLowerCase();
    const dept = uiState.selectedDeptFilter;
    const cat = uiState.selectedCategoryFilter;

    return attendanceRecords.filter(it => {
      const matchesQuery =
        !q ||
        it.studentName.toLowerCase().includes(q) ||
        it.sNo.includes(q) ||
        it.dept.toLowerCase().includes(q);
      const matchesDept = dept === 'All' || it.dept.toLowerCase() === dept.toLowerCase();
      const matchesCat = cat === 'All' || it.courseType?.toLowerCase() === cat.toLowerCase();
      return matchesQuery && matchesDept && matchesCat;
    });
  }, [uiState.searchQuery, uiState.selectedDeptFilter, uiState.selectedCategoryFilter, attendanceRecords]);

  const openProfileSheet = () => setUiState(prev => ({ ...prev, isProfileSheetOpen: true }));
  const closeProfileSheet = () => setUiState(prev => ({ ...prev, isProfileSheetOpen: false }));

  const openExportModal = () => setUiState(prev => ({ ...prev, isExportModalOpen: true }));
  const closeExportModal = () => setUiState(prev => ({ ...prev, isExportModalOpen: false }));

  const openMongoDbInfo = () => setUiState(prev => ({ ...prev, isMongoDbInfoOpen: true }));
  const closeMongoDbInfo = () => setUiState(prev => ({ ...prev, isMongoDbInfoOpen: false }));

  const openDocPreview = (title: string, content: string) => {
    setUiState(prev => ({
      ...prev,
      isDocPreviewOpen: true,
      docPreviewTitle: title,
      docPreviewContent: content
    }));
  };
  const closeDocPreview = () => setUiState(prev => ({ ...prev, isDocPreviewOpen: false }));

  const dismissNotification = () => setUiState(prev => ({ ...prev, userNotification: null }));

  const exportCsv = () => {
    setUiState(prev => ({
      ...prev,
      isExportModalOpen: true,
      userNotification: 'Attendance Sheet (GGU_CS401_Attendance.csv) prepared for download!'
    }));
  };

  const saveAndPublish = () => {
    setUiState(prev => ({
      ...prev,
      userNotification: 'Attendance records published to GGU SAMARTH / Academic Portal (40/45 verified).'
    }));
  };

  const prevReportPage = () => {
    setUiState(prev => ({
      ...prev,
      reportCurrentPage: Math.max(0, prev.reportCurrentPage - 1)
    }));
  };

  const nextReportPage = () => {
    const total = getFilteredAttendanceRecords().length;
    const totalPages = Math.ceil(total / uiState.reportPageSize);
    setUiState(prev => ({
      ...prev,
      reportCurrentPage: prev.reportCurrentPage < totalPages - 1 ? prev.reportCurrentPage + 1 : prev.reportCurrentPage
    }));
  };

  const parseStudentCourseSlip = async (file: File | null) => {
    setUiState(prev => ({ ...prev, isParsingDocument: true, userNotification: file ? 'Analyzing course selection slip with AI...' : null }));
    try {
      const parsed = await DocParserService.parseStudentCourseSlip(
        file,
        uiState.studentRegName,
        uiState.studentRegEnrollment
      );
      setUiState(prev => ({
        ...prev,
        isParsingDocument: false,
        studentParsedDoc: parsed,
        studentRegName: parsed.studentName || prev.studentRegName,
        studentRegEnrollment: parsed.enrollmentNo || prev.studentRegEnrollment,
        studentDepartment: parsed.department || prev.studentDepartment,
        studentSemester: parsed.semester || prev.studentSemester,
        studentCourseLevel: parsed.courseLevel || prev.studentCourseLevel,
        userNotification: `✅ Auto-fetched: ${parsed.studentName || 'Student'} (${parsed.enrollmentNo || 'Roll No.'}), Sem: ${parsed.semester || 'N/A'}, ${parsed.enrolledCourses.length} Courses`
      }));
    } catch (err: any) {
      setUiState(prev => ({
        ...prev,
        isParsingDocument: false,
        userNotification: `⚠️ Document scan note: ${err?.message || 'Could not parse document. You can still enter details manually.'}`
      }));
    }
  };

  const parseTeacherIdCard = async (file: File | null) => {
    triggerHaptic('light');
    setUiState(prev => ({
      ...prev,
      isParsingTeacherIdCard: true,
      userNotification: file ? 'Analyzing Faculty ID Card with AI...' : null
    }));
    try {
      const parsed = await DocParserService.parseTeacherIdCard(
        file,
        uiState.teacherRegName,
        uiState.teacherRegFacultyId
      );
      triggerHaptic('success');
      setUiState(prev => {
        const updatedTeacherParsedDoc = prev.teacherParsedDoc
          ? {
              ...prev.teacherParsedDoc,
              facultyName: parsed.facultyName || prev.teacherParsedDoc.facultyName,
              facultyId: parsed.facultyId || prev.teacherParsedDoc.facultyId,
              department: parsed.department || prev.teacherParsedDoc.department,
              designation: parsed.designation || prev.teacherParsedDoc.designation,
              idCardDoc: parsed
            }
          : {
              documentName: parsed.documentName,
              facultyName: parsed.facultyName,
              facultyId: parsed.facultyId,
              department: parsed.department,
              designation: parsed.designation || 'Associate Professor',
              teachingSchedule: [],
              idCardDoc: parsed,
              timetableDoc: prev.teacherTimetableDoc
            };

        return {
          ...prev,
          isParsingTeacherIdCard: false,
          teacherIdCardDoc: parsed,
          teacherParsedDoc: updatedTeacherParsedDoc,
          teacherRegName: parsed.facultyName || prev.teacherRegName,
          teacherRegFacultyId: parsed.facultyId || prev.teacherRegFacultyId,
          teacherDepartment: parsed.department || prev.teacherDepartment,
          userNotification: `✅ Faculty ID Card Verified: ${parsed.facultyName} (${parsed.facultyId}) • ${parsed.department}`
        };
      });
    } catch (err: any) {
      triggerHaptic('error');
      setUiState(prev => ({
        ...prev,
        isParsingTeacherIdCard: false,
        userNotification: `⚠️ ID Card scan note: ${err?.message || 'Could not parse ID Card. Please check image or enter details manually.'}`
      }));
    }
  };

  const parseTeacherTimeTable = async (file: File | null) => {
    triggerHaptic('light');
    setUiState(prev => ({
      ...prev,
      isParsingTeacherTimetable: true,
      isParsingDocument: true,
      userNotification: file ? 'Analyzing Routine & Timetable with AI...' : null
    }));
    try {
      const parsed = await DocParserService.parseTeacherTimeTable(
        file,
        uiState.teacherRegName,
        uiState.teacherRegFacultyId
      );
      triggerHaptic('success');
      const timetableData = {
        documentName: parsed.documentName,
        teachingSchedule: parsed.teachingSchedule
      };

      setUiState(prev => {
        const updatedTeacherParsedDoc = prev.teacherParsedDoc
          ? {
              ...prev.teacherParsedDoc,
              teachingSchedule: parsed.teachingSchedule,
              timetableDoc: timetableData
            }
          : {
              ...parsed,
              timetableDoc: timetableData,
              idCardDoc: prev.teacherIdCardDoc
            };

        return {
          ...prev,
          isParsingTeacherTimetable: false,
          isParsingDocument: false,
          teacherTimetableDoc: timetableData,
          teacherParsedDoc: updatedTeacherParsedDoc,
          teacherRegName: parsed.facultyName || prev.teacherRegName,
          teacherRegFacultyId: parsed.facultyId || prev.teacherRegFacultyId,
          teacherDepartment: parsed.department || prev.teacherDepartment,
          userNotification: `✅ Timetable Routine Verified: ${parsed.teachingSchedule.length} Teaching Classes Allotted`
        };
      });
    } catch (err: any) {
      triggerHaptic('error');
      setUiState(prev => ({
        ...prev,
        isParsingTeacherTimetable: false,
        isParsingDocument: false,
        userNotification: `⚠️ Timetable scan note: ${err?.message || 'Could not parse timetable. You can still enter details manually.'}`
      }));
    }
  };

  const updateStudentParsedData = (data: Partial<StudentParsedDocumentData>) => {
    setUiState(prev => {
      if (!prev.studentParsedDoc) return prev;
      return {
        ...prev,
        studentParsedDoc: { ...prev.studentParsedDoc, ...data }
      };
    });
  };

  const updateStudentCourseItem = (index: number, updated: Partial<EnrolledCourseItem>) => {
    setUiState(prev => {
      if (!prev.studentParsedDoc) return prev;
      const courses = [...prev.studentParsedDoc.enrolledCourses];
      courses[index] = { ...courses[index], ...updated };
      return {
        ...prev,
        studentParsedDoc: { ...prev.studentParsedDoc, enrolledCourses: courses }
      };
    });
  };

  const addStudentCourseItem = (course: EnrolledCourseItem) => {
    setUiState(prev => {
      if (!prev.studentParsedDoc) return prev;
      return {
        ...prev,
        studentParsedDoc: {
          ...prev.studentParsedDoc,
          enrolledCourses: [...prev.studentParsedDoc.enrolledCourses, course]
        }
      };
    });
  };

  const removeStudentCourseItem = (index: number) => {
    setUiState(prev => {
      if (!prev.studentParsedDoc) return prev;
      return {
        ...prev,
        studentParsedDoc: {
          ...prev.studentParsedDoc,
          enrolledCourses: prev.studentParsedDoc.enrolledCourses.filter((_, i) => i !== index)
        }
      };
    });
  };

  const updateTeacherParsedData = (data: Partial<TeacherParsedDocumentData>) => {
    setUiState(prev => {
      if (!prev.teacherParsedDoc) return prev;
      return {
        ...prev,
        teacherParsedDoc: { ...prev.teacherParsedDoc, ...data }
      };
    });
  };

  const updateTeacherScheduleItem = (index: number, updated: Partial<TeacherTeachingScheduleItem>) => {
    setUiState(prev => {
      if (!prev.teacherParsedDoc) return prev;
      const sched = [...prev.teacherParsedDoc.teachingSchedule];
      sched[index] = { ...sched[index], ...updated };
      return {
        ...prev,
        teacherParsedDoc: { ...prev.teacherParsedDoc, teachingSchedule: sched }
      };
    });
  };

  const addTeacherScheduleItem = (item: TeacherTeachingScheduleItem) => {
    setUiState(prev => {
      if (!prev.teacherParsedDoc) return prev;
      return {
        ...prev,
        teacherParsedDoc: {
          ...prev.teacherParsedDoc,
          teachingSchedule: [...prev.teacherParsedDoc.teachingSchedule, item]
        }
      };
    });
  };

  const removeTeacherScheduleItem = (index: number) => {
    setUiState(prev => {
      if (!prev.teacherParsedDoc) return prev;
      return {
        ...prev,
        teacherParsedDoc: {
          ...prev.teacherParsedDoc,
          teachingSchedule: prev.teacherParsedDoc.teachingSchedule.filter((_, i) => i !== index)
        }
      };
    });
  };

  const setSelectedBroadcastSessionCode = (code: string) => {
    setUiState(prev => ({ ...prev, selectedBroadcastSessionCode: code }));
  };

  const finalizeRegistration = async (): Promise<boolean> => {
    const isTeacher = uiState.currentRole === 'TEACHER';
    if (isTeacher) {
      const res = await ApiService.register({
        role: 'TEACHER',
        name: uiState.teacherRegName || uiState.teacherParsedDoc?.facultyName || 'Faculty Member',
        identifier: uiState.teacherRegFacultyId || uiState.teacherParsedDoc?.facultyId || 'FAC-CS-01',
        email: uiState.teacherRegEmail || `${uiState.teacherRegFacultyId || 'faculty'}@ggu.ac.in`,
        department: uiState.teacherDepartment || 'Computer Science & Engineering',
        password: uiState.teacherRegPassword || 'password123'
      });
      if (res.success) {
        navigateTo('REGISTRATION_SUCCESS');
        return true;
      }
      return false;
    } else {
      const res = await ApiService.register({
        role: 'STUDENT',
        name: uiState.studentRegName || uiState.studentParsedDoc?.studentName || 'Student User',
        identifier: uiState.studentRegEnrollment || uiState.studentParsedDoc?.enrollmentNo || '2024-BTECH-01',
        email: uiState.studentRegEmail || `${uiState.studentRegEnrollment || 'student'}@ggu.ac.in`,
        department: uiState.studentDepartment || 'CSIT',
        password: uiState.studentRegPassword || 'password123'
      });
      if (res.success) {
        navigateTo('REGISTRATION_SUCCESS');
        return true;
      }
      return false;
    }
  };

  return (
    <AttendanceContext.Provider
      value={{
        uiState,
        sampleStudentRoster: initialStudentRoster,
        sampleUgSessions: initialUgSessions,
        samplePgSessions: initialPgSessions,
        attendanceRecords,
        selectRole,
        switchRole,
        setAuthTab,
        navigateTo,
        goBack,
        updateStudentEnrollment,
        updateStudentPassword,
        updateTeacherFacultyId,
        updateTeacherPassword,
        updateStudentRegName,
        updateStudentRegEnrollment,
        updateStudentRegEmail,
        updateStudentCourseLevel,
        updateStudentDepartment,
        updateStudentSemester,
        updateTeacherRegName,
        updateTeacherRegFacultyId,
        updateTeacherRegEmail,
        updateTeacherDepartment,
        appendBroadcastPinDigit,
        backspaceBroadcastPin,
        clearBroadcastPin,
        appendStudentPinDigit,
        backspaceStudentPin,
        clearStudentPin,
        toggleCampusGeofence,
        triggerBroadcastSession,
        dismissIncomingAlert,
        acceptIncomingSessionAlert,
        submitStudentAttendance,
        resetStudentAttendance,
        startBroadcastTimer,
        stopBroadcastTimer,
        setPhysicalHeadcount,
        toggleAuditMode,
        cancelStudentAttendance,
        confirmStudentAttendance,
        toggleStudentAttendance,
        setSearchQuery,
        setDeptFilter,
        setCategoryFilter,
        getFilteredAttendanceRecords,
        openProfileSheet,
        closeProfileSheet,
        openExportModal,
        closeExportModal,
        openMongoDbInfo,
        closeMongoDbInfo,
        openDocPreview,
        closeDocPreview,
        dismissNotification,
        exportCsv,
        saveAndPublish,
        prevReportPage,
        nextReportPage,
        parseStudentCourseSlip,
        parseTeacherIdCard,
        parseTeacherTimeTable,
        updateStudentParsedData,
        updateStudentCourseItem,
        addStudentCourseItem,
        removeStudentCourseItem,
        updateTeacherParsedData,
        updateTeacherScheduleItem,
        addTeacherScheduleItem,
        removeTeacherScheduleItem,
        finalizeRegistration,
        setSelectedBroadcastSessionCode
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};
