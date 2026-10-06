import React, { useState, useRef } from 'react';
import {
  Eye,
  EyeOff,
  AlertCircle,
  Upload,
  FileText,
  Calendar,
  CheckCircle2,
  Trash2,
  Loader2,
  CreditCard,
  Clock,
  Building,
  Check,
  Mail,
  KeyRound
} from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';
import { AuthTopBar } from '../components/CommonTopBar';
import { ApiService } from '../services/api';
import { triggerHaptic } from '../utils/haptic';

export const AuthScreen: React.FC = () => {
  const {
    uiState,
    goBack,
    switchRole,
    setAuthTab,
    navigateTo,
    dismissNotification,
    updateStudentEnrollment,
    updateStudentPassword,
    updateTeacherFacultyId,
    updateTeacherPassword,
    updateStudentRegName,
    updateStudentRegEnrollment,
    updateStudentRegEmail,
    updateStudentDepartment,
    updateStudentSemester,
    updateTeacherRegName,
    updateTeacherRegFacultyId,
    updateTeacherRegEmail,
    updateTeacherDepartment,
    parseStudentCourseSlip,
    parseTeacherIdCard,
    parseTeacherTimeTable,
    removeStudentCourseItem,
    removeTeacherScheduleItem
  } = useAttendance();

  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPasswordDialog, setShowForgotPasswordDialog] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot password credential recovery states
  const [forgotQuery, setForgotQuery] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [forgotSentData, setForgotSentData] = useState<any>(null);

  const studentSlipInputRef = useRef<HTMLInputElement>(null);
  const teacherIdCardInputRef = useRef<HTMLInputElement>(null);
  const teacherTimetableInputRef = useRef<HTMLInputElement>(null);

  const [studentRegPassword, setStudentRegPassword] = useState('');
  const [studentRegConfirm, setStudentRegConfirm] = useState('');
  const [teacherRegPassword, setTeacherRegPassword] = useState('');
  const [teacherRegConfirm, setTeacherRegConfirm] = useState('');

  const isTeacher = uiState.currentRole === 'TEACHER';
  const brandColor = isTeacher ? '#D97728' : '#0F87AC';

  const handleStudentSlipUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      parseStudentCourseSlip(file);
    }
  };

  const handleTeacherIdCardUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      parseTeacherIdCard(file);
    }
  };

  const handleTeacherTimetableUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      parseTeacherTimeTable(file);
    }
  };

  const handleTeacherLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const res = await ApiService.login('TEACHER', uiState.teacherFacultyId, uiState.teacherPassword);
    if (res.success) {
      triggerHaptic('success');
      navigateTo('TEACHER_BROADCAST_SETUP');
    } else {
      triggerHaptic('error');
      setAuthError(res.error || 'Invalid credentials');
    }
  };

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const res = await ApiService.login('STUDENT', uiState.studentEnrollment, uiState.studentPassword);
    if (res.success) {
      triggerHaptic('success');
      navigateTo('STUDENT_ATTENDANCE');
    } else {
      triggerHaptic('error');
      setAuthError(res.error || 'Invalid credentials');
    }
  };

  const handleTeacherRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uiState.teacherRegEmail || !uiState.teacherRegEmail.trim()) {
      triggerHaptic('error');
      setAuthError('Email address is required so credentials can be sent if you forget your password.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(uiState.teacherRegEmail.trim())) {
      triggerHaptic('error');
      setAuthError('Please enter a valid institutional or personal email address.');
      return;
    }
    if (teacherRegPassword && teacherRegPassword !== teacherRegConfirm) {
      triggerHaptic('error');
      setAuthError('Passwords do not match');
      return;
    }
    setAuthError(null);
    setIsSubmitting(true);
    const res = await ApiService.register({
      role: 'TEACHER',
      name: uiState.teacherRegName || uiState.teacherParsedDoc?.facultyName || 'Faculty Member',
      identifier: uiState.teacherRegFacultyId || uiState.teacherParsedDoc?.facultyId || 'FAC-CS-01',
      email: uiState.teacherRegEmail.trim(),
      department: uiState.teacherDepartment || 'Computer Science & Engineering',
      password: teacherRegPassword || 'password123'
    });
    setIsSubmitting(false);
    if (res.success) {
      triggerHaptic('success');
      navigateTo('REGISTRATION_SUCCESS');
    } else {
      triggerHaptic('error');
      setAuthError(res.error || 'Registration failed');
    }
  };

  const handleStudentRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uiState.studentRegEmail || !uiState.studentRegEmail.trim()) {
      triggerHaptic('error');
      setAuthError('Email address is required so credentials can be sent if you forget your password.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(uiState.studentRegEmail.trim())) {
      triggerHaptic('error');
      setAuthError('Please enter a valid institutional or personal email address.');
      return;
    }
    if (studentRegPassword && studentRegPassword !== studentRegConfirm) {
      triggerHaptic('error');
      setAuthError('Passwords do not match');
      return;
    }
    setAuthError(null);
    setIsSubmitting(true);
    const res = await ApiService.register({
      role: 'STUDENT',
      name: uiState.studentRegName || uiState.studentParsedDoc?.studentName || 'Student User',
      identifier: uiState.studentRegEnrollment || uiState.studentParsedDoc?.enrollmentNo || '2024-BTECH-01',
      email: uiState.studentRegEmail.trim(),
      department: uiState.studentDepartment || 'CSIT',
      password: studentRegPassword || 'password123'
    });
    setIsSubmitting(false);
    if (res.success) {
      triggerHaptic('success');
      navigateTo('REGISTRATION_SUCCESS');
    } else {
      triggerHaptic('error');
      setAuthError(res.error || 'Registration failed');
    }
  };

  const handleSendForgotCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotQuery || !forgotQuery.trim()) {
      setForgotError('Please enter your registered Email or ID / Enrollment No.');
      return;
    }
    setForgotLoading(true);
    setForgotError(null);
    setForgotSuccess(null);
    setForgotSentData(null);
    const res = await ApiService.recoverCredentials(uiState.currentRole, forgotQuery.trim());
    setForgotLoading(false);
    if (res.success) {
      triggerHaptic('success');
      setForgotSuccess(res.message);
      setForgotSentData(res.previewSentInfo);
    } else {
      triggerHaptic('error');
      setForgotError(res.error || 'Account not found. Please verify your details.');
    }
  };

  const handleUseRetrievedCredentials = () => {
    if (!forgotSentData) return;
    triggerHaptic('success');
    if (isTeacher) {
      updateTeacherFacultyId(forgotSentData.identifier);
      updateTeacherPassword(forgotSentData.password);
    } else {
      updateStudentEnrollment(forgotSentData.identifier);
      updateStudentPassword(forgotSentData.password);
    }
    setAuthTab('LOGIN');
    setShowForgotPasswordDialog(false);
  };

  const hasParsedDoc = isTeacher
    ? Boolean(uiState.teacherParsedDoc)
    : Boolean(uiState.studentParsedDoc);

  return (
    <div data-testid="auth_screen" className="w-full min-h-screen bg-slate-50/50 flex flex-col">
      <AuthTopBar onBackClick={goBack} onSwitchRoleClick={switchRole} />

      {/* Hidden File Inputs for Verification Documents */}
      <input
        ref={studentSlipInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/*"
        onClick={(e) => {
          (e.target as HTMLInputElement).value = '';
        }}
        onChange={handleStudentSlipUpload}
        className="hidden"
      />

      <input
        ref={teacherIdCardInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/*"
        onClick={(e) => {
          (e.target as HTMLInputElement).value = '';
        }}
        onChange={handleTeacherIdCardUpload}
        className="hidden"
      />

      <input
        ref={teacherTimetableInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/*"
        onClick={(e) => {
          (e.target as HTMLInputElement).value = '';
        }}
        onChange={handleTeacherTimetableUpload}
        className="hidden"
      />

      <div className="flex-1 w-full max-w-md mx-auto px-6 py-4 overflow-y-auto">
        {/* Role Title */}
        <h2
          data-testid="auth_role_title"
          className="text-center text-[16px] font-black tracking-[3px] text-slate-900 py-1"
        >
          {isTeacher ? 'TEACHER PORTAL' : 'STUDENT PORTAL'}
        </h2>
        <p className="text-center text-[11px] text-slate-500 mb-4">
          Guru Ghasidas Vishwavidyalaya (GGU) Attendance
        </p>

        {/* Segmented Auth Control */}
        <div
          data-testid="auth_segmented_control"
          className="w-full rounded-xl border border-slate-200 bg-white p-1 flex items-center mb-4 shadow-xs"
        >
          <button
            type="button"
            data-testid="tab_login"
            onClick={() => setAuthTab('LOGIN')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              uiState.authTab === 'LOGIN'
                ? 'text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            style={{ backgroundColor: uiState.authTab === 'LOGIN' ? brandColor : 'transparent' }}
          >
            Log In
          </button>

          <button
            type="button"
            data-testid="tab_register"
            onClick={() => setAuthTab('REGISTER')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              uiState.authTab === 'REGISTER'
                ? 'text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            style={{ backgroundColor: uiState.authTab === 'REGISTER' ? brandColor : 'transparent' }}
          >
            Register
          </button>
        </div>

        {/* Error Notification Banner */}
        {authError && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2 animate-alert-drop">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">{authError}</div>
          </div>
        )}

        {/* Real-time Operation & Scan Notification Banner */}
        {uiState.userNotification && (
          <div className={`mb-4 p-3 rounded-xl border text-xs font-medium flex items-start gap-2 shadow-xs transition ${
            uiState.userNotification.startsWith('✅')
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : uiState.userNotification.startsWith('⚠️')
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-blue-50 border-blue-200 text-blue-900'
          }`}>
            <span className="text-sm shrink-0">
              {uiState.userNotification.startsWith('✅') ? '✅' : uiState.userNotification.startsWith('⚠️') ? '⚠️' : 'ℹ️'}
            </span>
            <div className="flex-1 font-semibold">{uiState.userNotification.replace(/^[✅⚠️ℹ️❌]\s*/, '')}</div>
            <button
              type="button"
              onClick={dismissNotification}
              className="text-slate-400 hover:text-slate-700 text-xs px-1 cursor-pointer font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* LOGIN FORM */}
        {/* ======================================================== */}
        {uiState.authTab === 'LOGIN' ? (
          isTeacher ? (
            /* Teacher Login */
            <form onSubmit={handleTeacherLogin} className="flex flex-col gap-3.5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Faculty ID / Email
                </label>
                <input
                  type="text"
                  data-testid="teacher_faculty_id_input"
                  value={uiState.teacherFacultyId}
                  onChange={(e) => updateTeacherFacultyId(e.target.value)}
                  placeholder="e.g. FAC-CS-01"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#D97728]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    data-testid="teacher_password_input"
                    value={uiState.teacherPassword}
                    onChange={(e) => updateTeacherPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-11 px-3.5 pr-10 rounded-xl border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#D97728]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowForgotPasswordDialog(true)}
                  className="text-[11px] font-semibold text-[#D97728] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                data-testid="teacher_login_button"
                className="w-full h-11 rounded-xl bg-[#D97728] hover:bg-[#A34B16] text-white text-xs font-bold transition shadow-xs mt-1 cursor-pointer active:scale-98"
              >
                Log In
              </button>
            </form>
          ) : (
            /* Student Login */
            <form onSubmit={handleStudentLogin} className="flex flex-col gap-3.5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Enrollment / Roll No.
                </label>
                <input
                  type="text"
                  data-testid="student_enrollment_input"
                  value={uiState.studentEnrollment}
                  onChange={(e) => updateStudentEnrollment(e.target.value)}
                  placeholder="e.g. 2024-BTECH-CS-042"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0F87AC]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    data-testid="student_password_input"
                    value={uiState.studentPassword}
                    onChange={(e) => updateStudentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 px-3.5 pr-10 rounded-xl border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0F87AC]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowForgotPasswordDialog(true)}
                  className="text-[11px] font-semibold text-[#0F87AC] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                data-testid="student_login_button"
                className="w-full h-11 rounded-xl bg-[#0F87AC] hover:bg-[#0C7394] text-white text-xs font-bold transition shadow-xs mt-1 cursor-pointer active:scale-98"
              >
                Log In
              </button>
            </form>
          )
        ) : (
          /* ======================================================== */
          /* REGISTER FORM WITH DIRECT DOCUMENT UPLOAD */
          /* ======================================================== */
          <div className="space-y-4">
            {isTeacher ? (
              /* ======================================================== */
              /* TEACHER REGISTRATION: 2 SEPARATE VERIFICATION SECTIONS   */
              /* ======================================================== */
              <div className="space-y-3.5">
                {/* 1. SEPARATE SECTION: FACULTY ID CARD UPLOAD */}
                <div
                  className={`p-4 rounded-2xl border-2 transition shadow-xs ${
                    uiState.isParsingTeacherIdCard
                      ? 'bg-orange-50/70 border-orange-400 border-dashed animate-pulse'
                      : uiState.teacherIdCardDoc || uiState.teacherRegFacultyId
                      ? 'bg-emerald-50/80 border-emerald-300 border-solid'
                      : 'bg-white border-slate-300 border-dashed'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      {uiState.isParsingTeacherIdCard ? (
                        <Loader2 className="w-5 h-5 animate-spin text-orange-600" />
                      ) : (
                        <CreditCard className="w-5 h-5 text-orange-600" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <span>Section 1: Faculty ID Card</span>
                          {(uiState.teacherIdCardDoc || uiState.teacherRegFacultyId) && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-600" />
                              Verified
                            </span>
                          )}
                        </h4>
                        <span className="text-[10px] text-orange-700 font-bold uppercase tracking-wider">Identity</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Upload photo or scan of your Teacher ID / Employee Card to auto-fill your name & faculty code.
                      </p>

                      {/* Extracted ID Card Data Banner */}
                      {(uiState.teacherIdCardDoc || uiState.teacherRegFacultyId) && !uiState.isParsingTeacherIdCard && (
                        <div className="mt-2.5 p-2 bg-emerald-100/70 rounded-lg text-[11px] text-emerald-950 flex flex-wrap gap-x-3 gap-y-1">
                          <span>👤 <strong>Name:</strong> {uiState.teacherRegName || 'Dr. Eleanor Vance'}</span>
                          <span>🆔 <strong>Faculty ID:</strong> {uiState.teacherRegFacultyId || 'FAC-CS-8924'}</span>
                          <span className="flex items-center gap-1">
                            <Building className="w-3 h-3 text-emerald-700 inline" />
                            <strong>Dept:</strong> {uiState.teacherDepartment || 'CSIT'}
                          </span>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="mt-3">
                        <button
                          type="button"
                          disabled={uiState.isParsingTeacherIdCard}
                          onClick={() => teacherIdCardInputRef.current?.click()}
                          className="w-full py-2 px-3.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs disabled:opacity-50"
                        >
                          {uiState.isParsingTeacherIdCard ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Scanning ID...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5" />
                              <span>{uiState.teacherIdCardDoc ? 'Change ID Card' : 'Upload ID Card (Image/PDF)'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. SEPARATE SECTION: TIMETABLE & ROUTINE UPLOAD */}
                <div
                  className={`p-4 rounded-2xl border-2 transition shadow-xs ${
                    uiState.isParsingTeacherTimetable
                      ? 'bg-amber-50/70 border-amber-400 border-dashed animate-pulse'
                      : uiState.teacherTimetableDoc || (uiState.teacherParsedDoc && uiState.teacherParsedDoc.teachingSchedule.length > 0)
                      ? 'bg-emerald-50/80 border-emerald-300 border-solid'
                      : 'bg-white border-slate-300 border-dashed'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      {uiState.isParsingTeacherTimetable ? (
                        <Loader2 className="w-5 h-5 animate-spin text-amber-700" />
                      ) : (
                        <Calendar className="w-5 h-5 text-amber-700" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <span>Section 2: Teaching Time Table & Schedule</span>
                          {(uiState.teacherTimetableDoc || (uiState.teacherParsedDoc && uiState.teacherParsedDoc.teachingSchedule.length > 0)) && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-600" />
                              Verified
                            </span>
                          )}
                        </h4>
                        <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Routine</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Upload your department teaching routine PDF to auto-allot your course codes, class timings, and room FB.
                      </p>

                      {/* Extracted Timetable Schedule Summary */}
                      {(uiState.teacherTimetableDoc || (uiState.teacherParsedDoc && uiState.teacherParsedDoc.teachingSchedule.length > 0)) && !uiState.isParsingTeacherTimetable && (
                        <div className="mt-2.5 p-2 bg-emerald-100/70 rounded-lg text-[11px] text-emerald-950 space-y-1.5">
                          <span className="font-bold block">
                            📋 {uiState.teacherParsedDoc?.teachingSchedule.length || 3} Classes Auto-Allotted:
                          </span>
                          <div className="flex flex-col gap-1">
                            {(uiState.teacherParsedDoc?.teachingSchedule || []).map((s, idx) => (
                              <div key={idx} className="flex items-center justify-between px-2 py-1 rounded bg-white border border-emerald-200 text-[10px]">
                                <span className="font-mono font-bold text-orange-900 truncate max-w-[150px]">
                                  {s.subjectCode} - {s.subjectName}
                                </span>
                                <div className="flex items-center gap-2 text-slate-600 shrink-0">
                                  <span className="flex items-center gap-0.5">
                                    <Clock className="w-3 h-3 text-amber-600" />
                                    {s.allotTime.split('-')[0].trim()}
                                  </span>
                                  <span className="flex items-center gap-0.5">
                                    <Building className="w-3 h-3 text-slate-400" />
                                    {s.room}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="mt-3">
                        <button
                          type="button"
                          disabled={uiState.isParsingTeacherTimetable}
                          onClick={() => teacherTimetableInputRef.current?.click()}
                          className="w-full py-2 px-3.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs disabled:opacity-50"
                        >
                          {uiState.isParsingTeacherTimetable ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Scanning Routine...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5" />
                              <span>{uiState.teacherTimetableDoc ? 'Change Timetable' : 'Upload Timetable (PDF)'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* STUDENT COURSE SELECTION SLIP CARD */
              <div className={`p-4 rounded-2xl border-2 border-dashed text-center shadow-xs transition ${
                uiState.isParsingDocument
                  ? 'bg-blue-50/70 border-blue-400 animate-pulse'
                  : hasParsedDoc
                  ? 'bg-emerald-50/70 border-emerald-300'
                  : 'bg-white border-slate-300'
              }`}>
                <div
                  className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center mb-2 shadow-xs transition-transform"
                  style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                >
                  {uiState.isParsingDocument ? (
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  ) : (
                    <FileText className="w-6 h-6" />
                  )}
                </div>

                <h3 className="text-xs font-bold text-slate-900 mb-0.5">
                  {uiState.isParsingDocument
                    ? 'AI Document OCR in Progress...'
                    : 'Upload Course Selection Slip (PDF / Image)'}
                </h3>

                <p className="text-[11px] text-slate-500 mb-3 max-w-xs mx-auto">
                  {uiState.isParsingDocument
                    ? 'Extracting Student Name, Enrollment / Roll No, Semester, and Enrolled Courses via Gemini OCR...'
                    : 'Auto-fetch your Name, Enrollment / Roll No, Semester, and Course subjects from your GGU slip'}
                </p>

                {/* Upload button */}
                <div className="flex justify-center">
                  <button
                    type="button"
                    disabled={uiState.isParsingDocument}
                    onClick={() => studentSlipInputRef.current?.click()}
                    className="w-full max-w-xs py-2.5 px-4 rounded-xl text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 active:scale-95 transition cursor-pointer disabled:opacity-50"
                    style={{ backgroundColor: brandColor }}
                  >
                    {uiState.isParsingDocument ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Scanning PDF...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Choose PDF / Image</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Document Extracted Success Notification */}
                {hasParsedDoc && !uiState.isParsingDocument && (
                  <div className="mt-3 pt-2.5 border-t border-emerald-200/80 text-left text-xs text-emerald-900 font-medium">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5 truncate">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="truncate font-bold">
                          Data fetched from {uiState.studentParsedDoc?.documentName}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => studentSlipInputRef.current?.click()}
                        className="text-[10px] text-emerald-700 font-bold hover:underline shrink-0 ml-1 cursor-pointer"
                      >
                        Change PDF
                      </button>
                    </div>
                    <div className="bg-emerald-100/70 rounded-lg p-2 text-[11px] text-emerald-950 flex flex-wrap gap-x-3 gap-y-1">
                      <span>👤 <strong>Name:</strong> {uiState.studentRegName || 'Not detected'}</span>
                      <span>🎓 <strong>Roll:</strong> {uiState.studentRegEnrollment || 'Not detected'}</span>
                      <span>📅 <strong>Sem:</strong> {uiState.studentSemester || 'Not detected'}</span>
                      <span>📚 <strong>Courses:</strong> {uiState.studentParsedDoc?.enrolledCourses.length || 0}</span>
                    </div>
                    <p className="text-[10px] text-emerald-700 mt-1 italic">
                      ✓ You can review and edit any of these details below if anything needs adjustment.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 2. REVIEW & EDIT FETCHED DETAILS FORM */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {hasParsedDoc ? 'Check & Edit Fetched Data' : 'Or Enter Details Manually'}
                </span>
                {hasParsedDoc && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Auto-Fetched (Editable)
                  </span>
                )}
              </div>

              {isTeacher ? (
                /* Teacher Registration Fields */
                <form onSubmit={handleTeacherRegister} className="flex flex-col gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Faculty Name
                    </label>
                    <input
                      type="text"
                      value={uiState.teacherRegName}
                      onChange={(e) => updateTeacherRegName(e.target.value)}
                      placeholder="e.g. Dr. Eleanor Vance"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-[#D97728] focus:outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Faculty ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={uiState.teacherRegFacultyId}
                        onChange={(e) => updateTeacherRegFacultyId(e.target.value)}
                        placeholder="FAC-CS-8924"
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-900 text-xs font-mono font-medium focus:ring-2 focus:ring-[#D97728] focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Department
                      </label>
                      <input
                        type="text"
                        value={uiState.teacherDepartment}
                        onChange={(e) => updateTeacherDepartment(e.target.value)}
                        placeholder="Computer Science & Engineering"
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-[#D97728] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Official Email <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[10px] text-orange-600 font-semibold flex items-center gap-0.5">
                        <Mail className="w-3 h-3" />
                        For Password Recovery
                      </span>
                    </div>
                    <input
                      type="email"
                      value={uiState.teacherRegEmail}
                      onChange={(e) => updateTeacherRegEmail(e.target.value)}
                      placeholder="e.g. dr.eleanor@ggu.ac.in"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-[#D97728] focus:outline-none"
                      required
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Your login credentials will be emailed to this address if you forget your password.
                    </p>
                  </div>

                  {/* Fetched Timetable Classes Display */}
                  {uiState.teacherParsedDoc && (
                    <div className="p-3 bg-orange-50/50 rounded-xl border border-orange-100 space-y-1.5">
                      <span className="text-[10px] font-bold text-orange-900 uppercase tracking-wider block">
                        Assigned Teaching Schedule ({uiState.teacherParsedDoc.teachingSchedule.length} classes fetched)
                      </span>
                      <div className="space-y-1">
                        {uiState.teacherParsedDoc.teachingSchedule.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded bg-white border border-orange-200/50">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-orange-900">{item.subjectCode}</span>
                                <span className="font-medium text-slate-700">{item.subjectName}</span>
                              </div>
                              <div className="flex items-center gap-2.5 text-[10px] text-slate-500 mt-0.5">
                                <span className="flex items-center gap-0.5">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  <span>{item.allotTime}</span>
                                </span>
                                <span className="flex items-center gap-0.5">
                                  <Building className="w-3 h-3 text-slate-400" />
                                  <span>{item.room}</span>
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeTeacherScheduleItem(idx)}
                              className="text-slate-400 hover:text-red-600 p-0.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        value={teacherRegPassword}
                        onChange={(e) => setTeacherRegPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-[#D97728] focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        value={teacherRegConfirm}
                        onChange={(e) => setTeacherRegConfirm(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-[#D97728] focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 rounded-xl bg-[#D97728] hover:bg-[#A34B16] text-white text-xs font-bold transition shadow-xs mt-2 cursor-pointer active:scale-98 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Registering...' : 'Complete Teacher Registration'}
                  </button>
                </form>
              ) : (
                /* Student Registration Fields */
                <form onSubmit={handleStudentRegister} className="flex flex-col gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-600">
                        Student Full Name
                      </label>
                      {uiState.studentRegName && (
                        <span className="text-[10px] text-teal-700 font-medium bg-teal-50 px-1.5 py-0.5 rounded">
                          Editable
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={uiState.studentRegName}
                      onChange={(e) => updateStudentRegName(e.target.value)}
                      placeholder="e.g. Rahul Kumar / Auto-fills from PDF"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-[#0F87AC] focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Student Email Address <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[10px] text-teal-700 font-semibold flex items-center gap-0.5">
                        <Mail className="w-3 h-3" />
                        For Password Recovery
                      </span>
                    </div>
                    <input
                      type="email"
                      value={uiState.studentRegEmail}
                      onChange={(e) => updateStudentRegEmail(e.target.value)}
                      placeholder="e.g. rahul.csit@ggu.ac.in or student@gmail.com"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-[#0F87AC] focus:outline-none"
                      required
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Credentials will be emailed to this address if you ever forget your password.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-600">
                          Enrollment / Roll No.
                        </label>
                        {uiState.studentRegEnrollment && (
                          <span className="text-[10px] text-teal-700 font-medium bg-teal-50 px-1.5 py-0.5 rounded">
                            Editable
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={uiState.studentRegEnrollment}
                        onChange={(e) => updateStudentRegEnrollment(e.target.value)}
                        placeholder="e.g. GGV/23/04812"
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-900 text-xs font-mono font-medium focus:ring-2 focus:ring-[#0F87AC] focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-600">
                          Course / Department
                        </label>
                        {uiState.studentDepartment && (
                          <span className="text-[10px] text-teal-700 font-medium bg-teal-50 px-1.5 py-0.5 rounded">
                            Editable
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={uiState.studentDepartment}
                        onChange={(e) => updateStudentDepartment(e.target.value)}
                        placeholder="e.g. B.Tech CSIT / MCA / B.Sc"
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-[#0F87AC] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-600">
                        Semester
                      </label>
                      {uiState.studentSemester && (
                        <span className="text-[10px] text-teal-700 font-medium bg-teal-50 px-1.5 py-0.5 rounded">
                          Editable
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={uiState.studentSemester}
                      onChange={(e) => updateStudentSemester(e.target.value)}
                      placeholder="e.g. 4th Semester"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-[#0F87AC] focus:outline-none"
                    />
                  </div>

                  {/* Fetched Courses from Course Selection Slip */}
                  {uiState.studentParsedDoc && (
                    <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-teal-900 uppercase tracking-wider block">
                          Fetched Courses from Slip ({uiState.studentParsedDoc.enrolledCourses.length})
                        </span>
                        <span className="text-[10px] text-teal-700">Verified</span>
                      </div>
                      <div className="space-y-1 max-h-36 overflow-y-auto">
                        {uiState.studentParsedDoc.enrolledCourses.map((c, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-white border border-teal-200/50">
                            <div className="truncate">
                              <span className="font-mono font-bold text-teal-900 mr-1.5">{c.code}</span>
                              <span className="font-medium text-slate-700">{c.subjectName}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeStudentCourseItem(idx)}
                              className="text-slate-400 hover:text-red-600 p-0.5 ml-1 shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        value={studentRegPassword}
                        onChange={(e) => setStudentRegPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-[#0F87AC] focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        value={studentRegConfirm}
                        onChange={(e) => setStudentRegConfirm(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-[#0F87AC] focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 rounded-xl bg-[#0F87AC] hover:bg-[#0C7394] text-white text-xs font-bold transition shadow-xs mt-2 cursor-pointer active:scale-98 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Registering...' : 'Complete Student Registration'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Forgot Password Dialog with Real Email Dispatch */}
      {showForgotPasswordDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => {
            setShowForgotPasswordDialog(false);
            setForgotError(null);
            setForgotSuccess(null);
            setForgotSentData(null);
          }}
        >
          <div
            className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl space-y-3.5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
              >
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Forgot Password?
                </h4>
                <p className="text-[11px] text-slate-500">
                  {isTeacher ? 'Teacher / Faculty Portal' : 'Student Portal'}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Enter your registered institutional email or your {isTeacher ? 'Faculty ID' : 'Enrollment / Roll No'}. Your login credentials will be immediately shared to your email.
            </p>

            {forgotError && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Credentials Sent Successfully!</span>
                </div>
                <p className="text-[11px] text-emerald-700">
                  {forgotSuccess}
                </p>
                {forgotSentData && (
                  <div className="p-2.5 rounded-lg bg-white border border-emerald-200/80 font-mono text-[11px] text-slate-800 space-y-1">
                    <div><strong>ID:</strong> {forgotSentData.identifier}</div>
                    <div><strong>Password:</strong> {forgotSentData.password}</div>
                    <div className="text-[10px] text-slate-400 font-sans">Sent to {forgotSentData.recipient} at {forgotSentData.sentAt}</div>
                  </div>
                )}
              </div>
            )}

            {!forgotSuccess ? (
              <form onSubmit={handleSendForgotCredentials} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Registered Email or {isTeacher ? 'Faculty ID' : 'Roll No'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={forgotQuery}
                      onChange={(e) => setForgotQuery(e.target.value)}
                      placeholder={isTeacher ? "e.g. FAC-CS-8924 or faculty@ggu.ac.in" : "e.g. GGV/23/04812 or student@gmail.com"}
                      className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-400"
                      required
                      autoFocus
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPasswordDialog(false);
                      setForgotError(null);
                    }}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="py-2 px-4 rounded-xl text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer disabled:opacity-50"
                    style={{ backgroundColor: brandColor }}
                  >
                    {forgotLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending to Email...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-3.5 h-3.5" />
                        <span>Share Credentials to Email</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPasswordDialog(false);
                    setForgotSuccess(null);
                    setForgotSentData(null);
                  }}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={handleUseRetrievedCredentials}
                  className="py-2 px-4 rounded-xl text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                  style={{ backgroundColor: brandColor }}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Log In With These Credentials</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
