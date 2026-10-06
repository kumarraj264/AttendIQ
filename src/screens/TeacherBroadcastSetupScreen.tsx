import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  User,
  MapPin,
  Radio,
  Clock,
  Repeat,
  Check,
  X,
  Sparkles
} from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';
import { NumericKeypad } from '../components/NumericKeypad';

export const TeacherBroadcastSetupScreen: React.FC = () => {
  const {
    uiState,
    goBack,
    navigateTo,
    openProfileSheet,
    appendBroadcastPinDigit,
    backspaceBroadcastPin,
    clearBroadcastPin,
    setSelectedBroadcastSessionCode,
    sampleUgSessions
  } = useAttendance();

  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [isManuallySwitched, setIsManuallySwitched] = useState(false);

  // Available classes from teacher's parsed timetable (or fallback)
  const availableSchedule = useMemo(() => {
    if (
      uiState.teacherParsedDoc?.teachingSchedule &&
      uiState.teacherParsedDoc.teachingSchedule.length > 0
    ) {
      return uiState.teacherParsedDoc.teachingSchedule;
    }
    return sampleUgSessions.map((s, idx) => ({
      id: `sched_${idx}`,
      subjectCode: s.subjectCode,
      subjectName: s.subjectName,
      courseType: s.courseType || 'Major',
      allotTime: s.allotTime || '10:15 AM - 11:15 AM',
      room: 'Room FB',
      offeringDept: s.offeringDept
    }));
  }, [uiState.teacherParsedDoc, sampleUgSessions]);

  // Determine current ongoing class based on time of day
  const timeBasedClass = useMemo(() => {
    const now = new Date();
    const currentHour = now.getHours(); // 0 - 23

    // Routine slot mapping:
    // Morning (< 11:30 AM): CS401
    // Midday (11:30 AM - 1:30 PM): CS405
    // Afternoon (1:30 PM onwards): SEC201
    if (currentHour < 12) {
      return (
        availableSchedule.find((s) => s.subjectCode.includes('401')) ||
        availableSchedule[0]
      );
    } else if (currentHour < 14) {
      return (
        availableSchedule.find((s) => s.subjectCode.includes('405')) ||
        availableSchedule[1] ||
        availableSchedule[0]
      );
    } else {
      return (
        availableSchedule.find((s) => s.subjectCode.includes('201')) ||
        availableSchedule[availableSchedule.length - 1] ||
        availableSchedule[0]
      );
    }
  }, [availableSchedule]);

  // If not manually switched by teacher, auto-select based on time table timing
  useEffect(() => {
    if (!isManuallySwitched && timeBasedClass) {
      setSelectedBroadcastSessionCode(timeBasedClass.subjectCode);
    }
  }, [timeBasedClass, isManuallySwitched, setSelectedBroadcastSessionCode]);

  const activeSession =
    availableSchedule.find(
      (s) => s.subjectCode === uiState.selectedBroadcastSessionCode
    ) ||
    timeBasedClass ||
    availableSchedule[0];

  const formattedPin =
    uiState.broadcastPin.length === 0
      ? '-  -'
      : uiState.broadcastPin.split('').join(' ');

  const handleSelectClass = (code: string) => {
    setSelectedBroadcastSessionCode(code);
    setIsManuallySwitched(true);
    setShowSwitchModal(false);
  };

  const handleResetToAutoTiming = () => {
    setIsManuallySwitched(false);
    setSelectedBroadcastSessionCode(timeBasedClass.subjectCode);
    setShowSwitchModal(false);
  };

  return (
    <div
      data-testid="teacher_broadcast_setup_screen"
      className="w-full min-h-screen bg-slate-50 flex flex-col justify-between"
    >
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-5 pt-3 pb-3 shrink-0 shadow-xs">
        <div className="flex items-center justify-between">
          <button
            type="button"
            data-testid="broadcast_setup_back_button"
            onClick={goBack}
            className="w-10 h-10 flex items-center justify-center rounded-full text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <span className="text-[10px] font-black text-orange-600 tracking-wider uppercase block">
              Teacher Broadcast Portal
            </span>
            <span className="text-xs font-semibold text-slate-600">
              {uiState.teacherRegName ||
                uiState.teacherParsedDoc?.facultyName ||
                'Faculty Member'}
            </span>
          </div>

          <button
            type="button"
            data-testid="broadcast_setup_avatar_button"
            onClick={openProfileSheet}
            className="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-xs cursor-pointer hover:scale-105 transition"
          >
            <User className="w-4 h-4" />
          </button>
        </div>

        {/* Automatic Time-Based Class Card */}
        <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50/50 border border-orange-200/90 shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isManuallySwitched ? 'bg-blue-600' : 'bg-emerald-600 animate-pulse'
                }`}
              />
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  isManuallySwitched ? 'text-blue-800' : 'text-emerald-800'
                }`}
              >
                {isManuallySwitched
                  ? 'Switched Class (Timing Adjusted)'
                  : 'Current Class per Time Table Slot'}
              </span>
            </div>

            {/* Quick Switch Class Button */}
            <button
              type="button"
              onClick={() => setShowSwitchModal(true)}
              className="text-[11px] font-bold text-orange-700 hover:text-orange-900 bg-white/80 hover:bg-white px-2.5 py-1 rounded-lg border border-orange-200/80 shadow-xs flex items-center gap-1 transition active:scale-95 cursor-pointer"
            >
              <Repeat className="w-3 h-3" />
              <span>Switch Class</span>
            </button>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="px-2 py-0.5 rounded bg-orange-600 text-white font-mono font-bold text-xs">
              {activeSession.subjectCode}
            </span>
            <h3 className="text-sm font-extrabold text-slate-900 truncate">
              {activeSession.subjectName}
            </h3>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-2">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-orange-600" />
              <span>{activeSession.allotTime}</span>
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-orange-600" />
              <span>{activeSession.room}</span>
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-600 font-medium">
              {activeSession.courseType} Course
            </span>
          </div>
        </div>
      </div>

      {/* Center Broadcast Radar + PIN display */}
      <div className="flex-1 flex flex-col items-center justify-center py-2 px-5">
        <div className="w-[160px] h-[160px] rounded-full border border-orange-300/60 p-2 flex items-center justify-center">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 flex flex-col items-center justify-center shadow-xs">
            <span className="text-[10px] font-black tracking-widest text-orange-700 uppercase">
              SESSION PIN
            </span>
            <span className="text-[34px] font-black tracking-[4px] text-slate-900 my-0.5 font-mono">
              {formattedPin}
            </span>
            <span className="text-[9px] text-slate-400 font-semibold">
              Wireless Proximity
            </span>
          </div>
        </div>

        <div className="mt-3 w-full">
          <NumericKeypad
            onDigitClick={appendBroadcastPinDigit}
            onClearClick={clearBroadcastPin}
            onBackspaceClick={backspaceBroadcastPin}
          />
        </div>
      </div>

      {/* Footer Action */}
      <div className="bg-white border-t border-slate-200 px-6 py-4 flex flex-col items-center shrink-0">
        <button
          type="button"
          data-testid="collect_attendance_button"
          onClick={() => navigateTo('TEACHER_BROADCAST_ACTIVE')}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-xs font-bold tracking-wider flex items-center justify-center gap-2 shadow-md active:scale-98 transition cursor-pointer"
        >
          <Radio className="w-4 h-4 animate-pulse" />
          <span>BROADCAST ATTENDANCE ({activeSession.subjectCode})</span>
        </button>

        <p className="text-[11px] text-slate-400 text-center mt-2">
          Only students enrolled in <strong>{activeSession.subjectCode}</strong> will receive the check-in option.
        </p>
      </div>

      {/* Modal: Switch Class / Reschedule Timing */}
      {showSwitchModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in"
          onClick={() => setShowSwitchModal(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl space-y-3 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Switch Lecture / Class
                </h4>
                <p className="text-[11px] text-slate-500">
                  Select a different subject if class timings were adjusted
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSwitchModal(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List of Time Table classes */}
            <div className="space-y-2">
              {availableSchedule.map((item) => {
                const isSelected = item.subjectCode === activeSession.subjectCode;
                const isAutoTimeMatch = item.subjectCode === timeBasedClass.subjectCode;
                return (
                  <div
                    key={item.subjectCode}
                    onClick={() => handleSelectClass(item.subjectCode)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50/60 ring-2 ring-orange-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-xs text-orange-900">
                          {item.subjectCode}
                        </span>
                        {isAutoTimeMatch && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            Current Slot
                          </span>
                        )}
                      </div>
                      <h5 className="text-xs font-bold text-slate-900 mt-0.5">
                        {item.subjectName}
                      </h5>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {item.allotTime} · {item.room}
                      </p>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-orange-600 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>

            {isManuallySwitched && (
              <button
                type="button"
                onClick={handleResetToAutoTiming}
                className="w-full py-2 rounded-xl text-center text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 transition flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Reset to Time Table Slot ({timeBasedClass.subjectCode})</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
