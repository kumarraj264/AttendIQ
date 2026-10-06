import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  User,
  Upload,
  FileText,
  CheckCircle2,
  Trash2,
  Plus,
  BookOpen,
  Calendar,
  Building,
  GraduationCap,
  Clock,
  MapPin,
  RefreshCw,
  CreditCard
} from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';

export const DocumentVerificationScreen: React.FC = () => {
  const {
    uiState,
    goBack,
    openProfileSheet,
    parseStudentCourseSlip,
    parseTeacherIdCard,
    parseTeacherTimeTable,
    updateStudentParsedData,
    addStudentCourseItem,
    removeStudentCourseItem,
    updateTeacherParsedData,
    addTeacherScheduleItem,
    removeTeacherScheduleItem,
    updateStudentRegEmail,
    updateTeacherRegEmail,
    finalizeRegistration
  } = useAttendance();

  const isTeacher = uiState.currentRole === 'TEACHER';
  const brandColor = isTeacher ? '#D97728' : '#0F87AC';

  const fileInputRef = useRef<HTMLInputElement>(null);
  const teacherIdCardInputRef = useRef<HTMLInputElement>(null);
  const teacherTimetableInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showAddScheduleModal, setShowAddScheduleModal] = useState(false);

  // New course modal state
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseType, setNewCourseType] = useState('Major');
  const [newCourseCredits, setNewCourseCredits] = useState('4');

  // New schedule modal state
  const [newSchedCode, setNewSchedCode] = useState('');
  const [newSchedName, setNewSchedName] = useState('');
  const [newSchedTime, setNewSchedTime] = useState('10:15 AM - 11:15 AM');
  const [newSchedRoom, setNewSchedRoom] = useState('Room FB');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (isTeacher) {
      parseTeacherTimeTable(file);
    } else {
      parseStudentCourseSlip(file);
    }
  };

  const handleTeacherIdCardUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) parseTeacherIdCard(file);
  };

  const handleTeacherTimetableUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) parseTeacherTimeTable(file);
  };

  const handleAddCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseCode || !newCourseName) return;
    addStudentCourseItem({
      code: newCourseCode.trim().toUpperCase(),
      subjectName: newCourseName.trim(),
      type: newCourseType,
      credits: parseInt(newCourseCredits, 10) || 3
    });
    setNewCourseCode('');
    setNewCourseName('');
    setShowAddCourseModal(false);
  };

  const handleAddScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchedCode || !newSchedName) return;
    addTeacherScheduleItem({
      id: `sched_${Date.now()}`,
      subjectCode: newSchedCode.trim().toUpperCase(),
      subjectName: newSchedName.trim(),
      courseType: 'Major',
      allotTime: newSchedTime.trim(),
      room: newSchedRoom.trim()
    });
    setNewSchedCode('');
    setNewSchedName('');
    setShowAddScheduleModal(false);
  };

  const handleFinalize = async () => {
    if (isTeacher && (!uiState.teacherRegEmail || !uiState.teacherRegEmail.trim())) {
      alert('Email address is required to register and recover credentials.');
      return;
    }
    if (!isTeacher && (!uiState.studentRegEmail || !uiState.studentRegEmail.trim())) {
      alert('Email address is required to register and recover credentials.');
      return;
    }
    setIsSubmitting(true);
    await finalizeRegistration();
    setIsSubmitting(false);
  };

  const hasParsedData = isTeacher
    ? Boolean(uiState.teacherParsedDoc)
    : Boolean(uiState.studentParsedDoc);

  return (
    <div
      data-testid="document_verification_screen"
      className="w-full min-h-screen bg-slate-50 flex flex-col justify-between"
    >
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-5 py-3 shrink-0">
        <div className="flex items-center justify-between">
          <button
            type="button"
            data-testid="doc_verify_back_button"
            onClick={goBack}
            className="w-10 h-10 flex items-center justify-center rounded-full text-slate-700 hover:bg-slate-100 active:scale-95 transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <span
              className="text-[10px] font-black tracking-widest uppercase block"
              style={{ color: brandColor }}
            >
              Step 2 of 2 · Document Intelligence
            </span>
            <h2 className="text-base font-bold text-slate-900 leading-tight">
              {isTeacher ? 'Faculty ID & Time Table Upload' : 'Course Selection Slip (PDF)'}
            </h2>
          </div>

          <button
            type="button"
            onClick={openProfileSheet}
            className="w-9 h-9 rounded-full flex items-center justify-center shadow-xs"
            style={{ backgroundColor: isTeacher ? '#FFF7ED' : '#E8F5F8' }}
          >
            <User className="w-4 h-4" style={{ color: brandColor }} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-lg mx-auto p-4 space-y-4 overflow-y-auto">
        {/* Hidden File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleFileUpload}
          className="hidden"
        />
        <input
          ref={teacherIdCardInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleTeacherIdCardUpload}
          className="hidden"
        />
        <input
          ref={teacherTimetableInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleTeacherTimetableUpload}
          className="hidden"
        />

        {/* 1. DOCUMENT UPLOAD ZONE */}
        {!hasParsedData && !uiState.isParsingDocument && (
          isTeacher ? (
            <div className="space-y-3.5">
              {/* Teacher ID Card Section */}
              <div className="bg-white rounded-2xl border-2 border-dashed border-orange-300 p-5 flex flex-col items-center text-center shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mb-2.5 shadow-sm">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-0.5">
                  1. Upload Faculty Identity Card
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mb-3">
                  Upload photo or scan of your Teacher ID / Employee Card to auto-verify your name and faculty ID.
                </p>
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => teacherIdCardInputRef.current?.click()}
                    className="py-2 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload ID Card (Image/PDF)</span>
                  </button>
                </div>
              </div>

              {/* Teacher Timetable Section */}
              <div className="bg-white rounded-2xl border-2 border-dashed border-amber-300 p-5 flex flex-col items-center text-center shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-2.5 shadow-sm">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-0.5">
                  2. Upload Teaching Time Table / Routine
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mb-3">
                  Upload your department routine PDF to auto-extract your assigned classes, time slots, and rooms.
                </p>
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => teacherTimetableInputRef.current?.click()}
                    className="py-2 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Timetable (PDF)</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-6 flex flex-col items-center text-center shadow-xs">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 shadow-md"
                style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
              >
                <FileText className="w-8 h-8" />
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-1">
                Upload GGU Course Selection Slip
              </h3>

              <p className="text-xs text-slate-500 max-w-xs mb-4">
                Upload your official GGU semester admission/course selection slip. Your enrolled subjects will be fetched automatically.
              </p>

              <div className="flex justify-center w-full max-w-xs">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 active:scale-95 transition cursor-pointer"
                  style={{ backgroundColor: brandColor }}
                >
                  <Upload className="w-4 h-4" />
                  <span>Choose PDF / Image</span>
                </button>
              </div>

              <span className="text-[10px] text-slate-400 mt-3">
                Supports: PDF, JPG, PNG (Max 15 MB)
              </span>
            </div>
          )
        )}

        {/* 2. PARSING PROGRESS ANIMATION */}
        {uiState.isParsingDocument && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col items-center justify-center text-center shadow-md animate-pulse">
            <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-teal-600 animate-spin mb-4" />
            <h4 className="text-sm font-bold text-slate-900">
              Analyzing Document & Extracting Roster...
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Extracting course codes, credits, and schedule details
            </p>
          </div>
        )}

        {/* 3. REVIEW & EDIT PARSED DATA (STUDENT) */}
        {!isTeacher && uiState.studentParsedDoc && !uiState.isParsingDocument && (
          <div className="space-y-3.5 animate-in fade-in duration-300">
            {/* Success Extraction Banner */}
            <div className="bg-emerald-50 border border-emerald-200/90 rounded-2xl p-3.5 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-emerald-950">
                    Course Selection Slip Fetched ({uiState.studentParsedDoc.documentName})
                  </h4>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[10px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Re-upload</span>
                  </button>
                </div>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  Review the extracted profile and course roster below. You can edit any field.
                </p>
              </div>
            </div>

            {/* Editable Profile Summary Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
              <h4 className="text-xs font-black text-slate-800 tracking-wider uppercase flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-teal-600" />
                <span>Student Academic Details</span>
              </h4>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                    Student Name
                  </label>
                  <input
                    type="text"
                    value={uiState.studentParsedDoc.studentName}
                    onChange={(e) =>
                      updateStudentParsedData({ studentName: e.target.value })
                    }
                    className="w-full h-9 px-2.5 rounded-lg border border-slate-200 text-slate-900 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                    Enrollment / Roll No.
                  </label>
                  <input
                    type="text"
                    value={uiState.studentParsedDoc.enrollmentNo}
                    onChange={(e) =>
                      updateStudentParsedData({ enrollmentNo: e.target.value })
                    }
                    className="w-full h-9 px-2.5 rounded-lg border border-slate-200 text-slate-900 font-mono font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={uiState.studentParsedDoc.department}
                    onChange={(e) =>
                      updateStudentParsedData({ department: e.target.value })
                    }
                    className="w-full h-9 px-2.5 rounded-lg border border-slate-200 text-slate-900 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                    Semester
                  </label>
                  <input
                    type="text"
                    value={uiState.studentParsedDoc.semester}
                    onChange={(e) =>
                      updateStudentParsedData({ semester: e.target.value })
                    }
                    className="w-full h-9 px-2.5 rounded-lg border border-slate-200 text-slate-900 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Student Email Address <span className="text-red-500">*</span> (For Password Recovery)
                  </label>
                  <input
                    type="email"
                    value={uiState.studentRegEmail}
                    onChange={(e) => updateStudentRegEmail(e.target.value)}
                    placeholder="e.g. student@gmail.com"
                    className="w-full h-9 px-2.5 rounded-lg border border-slate-200 text-slate-900 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Extracted Course Roster (Crucial: Defines which subjects student has!) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-800 tracking-wider uppercase flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-teal-600" />
                    <span>Enrolled Course Selection ({uiState.studentParsedDoc.enrolledCourses.length})</span>
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    These courses determine the live classes you can check in to.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddCourseModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-bold flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Subject</span>
                </button>
              </div>

              {/* Course list cards */}
              <div className="space-y-2">
                {uiState.studentParsedDoc.enrolledCourses.map((course, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="px-2 py-1 rounded bg-teal-100/70 text-teal-800 font-mono font-bold text-xs shrink-0">
                        {course.code}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {course.subjectName}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {course.type} · {course.credits} Credits {course.offeringDept ? `· ${course.offeringDept}` : ''}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeStudentCourseItem(idx)}
                      className="p-1 text-slate-400 hover:text-red-600 transition"
                      title="Remove course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. REVIEW & EDIT PARSED DATA (TEACHER) */}
        {isTeacher && uiState.teacherParsedDoc && !uiState.isParsingDocument && (
          <div className="space-y-3.5 animate-in fade-in duration-300">
            {/* Success Extraction Banner with Separate ID & Timetable Actions */}
            <div className="bg-orange-50 border border-orange-200/90 rounded-2xl p-3.5 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 className="text-xs font-bold text-orange-950">
                    Faculty Documents Verified ({uiState.teacherParsedDoc.documentName})
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => teacherIdCardInputRef.current?.click()}
                      className="text-[10px] font-bold text-orange-700 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <CreditCard className="w-3 h-3" />
                      <span>Change ID Card</span>
                    </button>
                    <span className="text-orange-300">|</span>
                    <button
                      type="button"
                      onClick={() => teacherTimetableInputRef.current?.click()}
                      className="text-[10px] font-bold text-orange-700 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Calendar className="w-3 h-3" />
                      <span>Change Timetable</span>
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-orange-800 mt-1">
                  Your ID card credentials and {uiState.teacherParsedDoc.teachingSchedule.length} teaching routine schedule slots are synced.
                </p>
              </div>
            </div>

            {/* Editable Teacher Profile Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
              <h4 className="text-xs font-black text-slate-800 tracking-wider uppercase flex items-center gap-1.5">
                <Building className="w-4 h-4 text-orange-600" />
                <span>Faculty Credentials</span>
              </h4>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                    Faculty Name
                  </label>
                  <input
                    type="text"
                    value={uiState.teacherParsedDoc.facultyName}
                    onChange={(e) =>
                      updateTeacherParsedData({ facultyName: e.target.value })
                    }
                    className="w-full h-9 px-2.5 rounded-lg border border-slate-200 text-slate-900 font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                    Faculty ID
                  </label>
                  <input
                    type="text"
                    value={uiState.teacherParsedDoc.facultyId}
                    onChange={(e) =>
                      updateTeacherParsedData({ facultyId: e.target.value })
                    }
                    className="w-full h-9 px-2.5 rounded-lg border border-slate-200 text-slate-900 font-mono font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={uiState.teacherParsedDoc.department}
                    onChange={(e) =>
                      updateTeacherParsedData({ department: e.target.value })
                    }
                    className="w-full h-9 px-2.5 rounded-lg border border-slate-200 text-slate-900 font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Official Email <span className="text-red-500">*</span> (For Password Recovery)
                  </label>
                  <input
                    type="email"
                    value={uiState.teacherRegEmail}
                    onChange={(e) => updateTeacherRegEmail(e.target.value)}
                    placeholder="e.g. faculty@ggu.ac.in"
                    className="w-full h-9 px-2.5 rounded-lg border border-slate-200 text-slate-900 font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Extracted Teaching Schedule (Crucial: Defines what subjects teacher can broadcast!) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-800 tracking-wider uppercase flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-orange-600" />
                    <span>Assigned Teaching Schedule ({uiState.teacherParsedDoc.teachingSchedule.length})</span>
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    These are the classes you are authorized to broadcast.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddScheduleModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Class</span>
                </button>
              </div>

              {/* Schedule list */}
              <div className="space-y-2">
                {uiState.teacherParsedDoc.teachingSchedule.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-900 font-mono font-bold text-xs shrink-0">
                          {item.subjectCode}
                        </span>
                        <h5 className="text-xs font-bold text-slate-900 truncate">
                          {item.subjectName}
                        </h5>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{item.allotTime}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{item.room}</span>
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeTeacherScheduleItem(idx)}
                      className="p-1 text-slate-400 hover:text-red-600 transition"
                      title="Remove class"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="bg-white border-t border-slate-200 p-4 shrink-0">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={goBack}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
          >
            Back
          </button>

          <button
            type="button"
            onClick={handleFinalize}
            disabled={!hasParsedData || isSubmitting}
            className="flex-1 py-3 px-5 rounded-xl text-white text-xs font-bold shadow-md hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 transition flex items-center justify-center gap-2 cursor-pointer"
            style={{ backgroundColor: brandColor }}
          >
            {isSubmitting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>
              {hasParsedData
                ? 'Verify & Complete Registration'
                : 'Upload Document to Continue'}
            </span>
          </button>
        </div>
      </div>

      {/* Modal: Add Custom Student Course */}
      {showAddCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <form
            onSubmit={handleAddCourseSubmit}
            className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl space-y-3"
          >
            <h4 className="text-sm font-bold text-slate-900">Add Course to Slip</h4>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Course Code
              </label>
              <input
                type="text"
                placeholder="e.g. CS401"
                value={newCourseCode}
                onChange={(e) => setNewCourseCode(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Subject Name
              </label>
              <input
                type="text"
                placeholder="e.g. Database Management Systems"
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Type
                </label>
                <select
                  value={newCourseType}
                  onChange={(e) => setNewCourseType(e.target.value)}
                  className="w-full h-9 px-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="Major">Major</option>
                  <option value="Minor">Minor</option>
                  <option value="SEC">SEC</option>
                  <option value="VAC">VAC</option>
                  <option value="AEC">AEC</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Credits
                </label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={newCourseCredits}
                  onChange={(e) => setNewCourseCredits(e.target.value)}
                  className="w-full h-9 px-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddCourseModal(false)}
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-bold hover:bg-teal-700"
              >
                Add Course
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Add Custom Teacher Schedule */}
      {showAddScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <form
            onSubmit={handleAddScheduleSubmit}
            className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl space-y-3"
          >
            <h4 className="text-sm font-bold text-slate-900">Add Class to Schedule</h4>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Subject Code
              </label>
              <input
                type="text"
                placeholder="e.g. CS401"
                value={newSchedCode}
                onChange={(e) => setNewSchedCode(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-orange-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Subject Name
              </label>
              <input
                type="text"
                placeholder="e.g. Database Management Systems"
                value={newSchedName}
                onChange={(e) => setNewSchedName(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Time Slot
                </label>
                <input
                  type="text"
                  placeholder="10:15 AM - 11:15 AM"
                  value={newSchedTime}
                  onChange={(e) => setNewSchedTime(e.target.value)}
                  className="w-full h-9 px-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Room
                </label>
                <input
                  type="text"
                  placeholder="Room FB"
                  value={newSchedRoom}
                  onChange={(e) => setNewSchedRoom(e.target.value)}
                  className="w-full h-9 px-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddScheduleModal(false)}
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-orange-600 text-white text-xs font-bold hover:bg-orange-700"
              >
                Add Class
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
