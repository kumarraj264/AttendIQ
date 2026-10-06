import React from 'react';
import { Bell, X, Timer, ArrowRight } from 'lucide-react';

interface TargetedAttendanceAlertProps {
  subjectCode: string;
  subjectName: string;
  isVisible: boolean;
  onAccept: () => void;
  onDismiss: () => void;
  className?: string;
}

export const TargetedAttendanceAlert: React.FC<TargetedAttendanceAlertProps> = ({
  subjectCode,
  subjectName,
  isVisible,
  onAccept,
  onDismiss,
  className = ''
}) => {
  if (!isVisible) return null;

  return (
    <div
      data-testid="targeted_attendance_alert"
      className={`w-full max-w-md mx-auto p-4 bg-[#0B1528]/95 backdrop-blur-md border border-amber-500/40 rounded-2xl shadow-2xl transition-all animate-alert-drop ${className}`}
    >
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30">
              <Bell className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-wider text-amber-400 block uppercase">
                Live Attendance Started
              </span>
              <span className="text-[11px] text-slate-300">Classroom broadcast detected</span>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="w-7 h-7 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
          <h4 className="text-[13px] font-bold text-white leading-tight">
            {subjectCode}: {subjectName}
          </h4>
          <div className="flex items-center justify-between text-[11px] text-slate-300 mt-1">
            <span>Dr. Eleanor Vance · Room FB</span>
            <div className="flex items-center gap-1 text-amber-400 font-bold">
              <Timer className="w-3.5 h-3.5 animate-pulse" />
              <span>3 min window</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-0.5">
          <button
            onClick={onDismiss}
            className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white text-xs font-semibold hover:bg-white/5 transition cursor-pointer"
          >
            Later
          </button>
          <button
            onClick={onAccept}
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <span>Enter Session PIN</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
