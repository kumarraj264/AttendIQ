import React, { useMemo } from 'react';
import {
  ArrowLeft,
  User,
  Check,
  Radio,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';
import { NumericKeypad } from '../components/NumericKeypad';
import { SlideToConfirmButton } from '../components/SlideToConfirmButton';

export const StudentAttendanceScreen: React.FC = () => {
  const {
    uiState,
    goBack,
    openProfileSheet,
    appendStudentPinDigit,
    backspaceStudentPin,
    clearStudentPin,
    submitStudentAttendance
  } = useAttendance();

  const activeBroadcastingCode = uiState.selectedBroadcastSessionCode || 'CS401';

  // Get student's enrolled courses from their course selection slip (or fallback)
  const enrolledCourses = useMemo(() => {
    if (
      uiState.studentParsedDoc?.enrolledCourses &&
      uiState.studentParsedDoc.enrolledCourses.length > 0
    ) {
      return uiState.studentParsedDoc.enrolledCourses;
    }
    return [
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
        subjectName: 'Environmental Studies',
        type: 'VAC',
        credits: 2,
        offeringDept: 'Env Sciences'
      }
    ];
  }, [uiState.studentParsedDoc]);

  // Check if current student is enrolled in the subject being broadcast
  const matchedEnrolledCourse = enrolledCourses.find(
    (c) => c.code.toUpperCase() === activeBroadcastingCode.toUpperCase()
  );

  const isEnrolledInActiveSession = Boolean(matchedEnrolledCourse);

  const hasD1 = uiState.studentEnteredPin.length > 0;
  const hasD2 = uiState.studentEnteredPin.length > 1;
  const d1 = hasD1 ? uiState.studentEnteredPin[0] : '';
  const d2 = hasD2 ? uiState.studentEnteredPin[1] : '';

  return (
    <div
      data-testid="student_attendance_screen"
      className="w-full min-h-screen bg-slate-50/50 flex flex-col justify-between"
    >
      {/* Top Header */}
      <div className="px-5 pt-3 pb-3 bg-white border-b border-slate-100 shrink-0">
        <div className="flex items-center justify-between">
          <button
            type="button"
            data-testid="student_attendance_back_button"
            onClick={goBack}
            className="w-10 h-10 flex items-center justify-center rounded-full text-slate-700 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <span className="text-[10px] font-black text-teal-600 tracking-wider uppercase block">
              Student Attendance Portal
            </span>
            <span className="text-xs font-semibold text-slate-600">
              {uiState.studentRegName ||
                uiState.studentParsedDoc?.studentName ||
                'Alex Morgan'}
            </span>
          </div>

          <button
            type="button"
            data-testid="student_avatar_button"
            onClick={openProfileSheet}
            className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#0C7394] to-[#0F87AC] flex items-center justify-center text-white shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <User className="w-4 h-4" />
          </button>
        </div>

        {/* If student IS enrolled in active broadcast class */}
        {isEnrolledInActiveSession && matchedEnrolledCourse && (
          <div className="mt-2.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-[#EAF5F8] text-[#0F87AC] text-[11px] font-bold tracking-wider">
                {matchedEnrolledCourse.code}
              </span>
              <span className="text-[12px] font-medium text-slate-400">·</span>
              <span className="text-[12px] font-medium text-slate-600">
                {matchedEnrolledCourse.type} Course
              </span>
            </div>

            <h2 className="text-[18px] font-extrabold text-slate-900 tracking-tight mt-0.5">
              {matchedEnrolledCourse.subjectName}
            </h2>

            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
              <span>Instructor: Dr. Eleanor Vance</span>
              <span className="font-semibold text-teal-700">Room FB</span>
            </div>

            {/* Live Campus GPS status */}
            <div className="mt-2 w-full rounded-xl px-3 py-1.5 flex items-center justify-between text-[11px] font-medium border bg-emerald-50/80 border-emerald-200/80 text-emerald-900">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
                </span>
                <span className="truncate">GGU Bilaspur Campus GPS: In Range</span>
              </div>
              <span className="font-bold text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/60">
                Verified
              </span>
            </div>
          </div>
        )}
      </div>

      {/* CASE 1: Student is ENROLLED in currently broadcast course -> Show Attendance Keypad */}
      {isEnrolledInActiveSession ? (
        <>
          <div className="flex-1 flex flex-col items-center justify-center py-2 relative">
            {/* Animated Radar Circles */}
            <div className="relative w-[190px] h-[190px] flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-teal-500/20 animate-ripple" />
              <div className="absolute inset-4 rounded-full border border-teal-500/30 animate-pulse" />
              <div className="w-[140px] h-[140px] rounded-full bg-white shadow-xl border border-slate-100 flex flex-col items-center justify-center z-10">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-black font-mono transition-all duration-150 ${
                      hasD1
                        ? 'border-teal-600 bg-teal-50/50 text-teal-900 animate-number-pop'
                        : 'border-slate-200 bg-slate-50 text-slate-300'
                    }`}
                  >
                    {d1 || '•'}
                  </div>

                  <div
                    className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-black font-mono transition-all duration-150 ${
                      hasD2
                        ? 'border-teal-600 bg-teal-50/50 text-teal-900 animate-number-pop'
                        : 'border-slate-200 bg-slate-50 text-slate-300'
                    }`}
                  >
                    {d2 || '•'}
                  </div>
                </div>

                <span className="text-[10px] font-semibold text-slate-400 mt-1.5 tracking-wider">
                  ENTER PIN
                </span>
              </div>
            </div>

            {/* Numeric Keypad */}
            <div className="w-full mt-2">
              <NumericKeypad
                onDigitClick={appendStudentPinDigit}
                onClearClick={clearStudentPin}
                onBackspaceClick={backspaceStudentPin}
              />
            </div>
          </div>

          {/* Footer Action: Slide to confirm */}
          <div className="px-6 py-4 bg-white border-t border-slate-100 shrink-0">
            {uiState.studentAttendanceMarked ? (
              <div className="w-full h-12 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md animate-in fade-in">
                <Check className="w-4 h-4" />
                <span>ATTENDANCE RECORDED IN MONGODB</span>
              </div>
            ) : (
              <SlideToConfirmButton
                title="SLIDE TO CONFIRM ATTENDANCE"
                onConfirmed={submitStudentAttendance}
                enabled={uiState.studentEnteredPin.length >= 2}
              />
            )}

            {uiState.studentAttendanceMessage && (
              <p className="text-[11px] text-center font-medium mt-2 text-slate-600">
                {uiState.studentAttendanceMessage}
              </p>
            )}
          </div>
        </>
      ) : (
        /* CASE 2: Student is NOT enrolled in the currently broadcast course */
        /* Clean personalized course roster view - No error banners! */
        <div className="flex-1 w-full max-w-md mx-auto p-5 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            {/* Informational Status Card */}
            <div className="p-4 rounded-2xl bg-slate-100/80 border border-slate-200 text-slate-700 space-y-1.5">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-slate-400" />
                <h3 className="text-xs font-bold text-slate-800">
                  No Active Lecture for Your Enrolled Subjects
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Attendance is currently not being broadcast for your enrolled courses.
                When your instructor starts attendance for any of your courses below, the check-in keypad will activate automatically.
              </p>
            </div>

            {/* Student's Enrolled Courses List from Slip */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                  <span>Your Enrolled Courses ({enrolledCourses.length})</span>
                </h4>
                <span className="text-[10px] text-slate-400">GGU Slip Verified</span>
              </div>

              <div className="space-y-2">
                {enrolledCourses.map((course) => (
                  <div
                    key={course.code}
                    className="p-3 rounded-xl border border-slate-200 bg-white shadow-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 font-mono font-bold text-xs">
                          {course.code}
                        </span>
                        <span className="text-[10px] text-slate-400">{course.type}</span>
                      </div>
                      <h5 className="text-xs font-bold text-slate-900 mt-1">
                        {course.subjectName}
                      </h5>
                    </div>

                    <span className="text-[11px] font-bold text-slate-400">
                      {course.credits} Credits
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center py-4">
            <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-teal-600" />
              <span>Only enrolled students receive the live check-in prompt</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
