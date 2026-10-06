import React, { useState } from 'react';
import { ArrowLeft, User, CheckCircle2, Square, Users, KeyRound, ChevronDown, ChevronUp } from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';

export const TeacherBroadcastActiveScreen: React.FC = () => {
  const {
    uiState,
    goBack,
    navigateTo,
    openProfileSheet,
    stopBroadcastTimer
  } = useAttendance();

  const [showRecentJoinsList, setShowRecentJoinsList] = useState(false);

  const minutes = Math.floor(uiState.broadcastSecondsLeft / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (uiState.broadcastSecondsLeft % 60).toString().padStart(2, '0');

  const progressFraction = Math.max(0, Math.min(uiState.broadcastSecondsLeft / 165, 1));
  const circleRadius = 108;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference * (1 - progressFraction);

  const isLowTime = uiState.broadcastSecondsLeft <= 30;

  return (
    <div
      data-testid="teacher_broadcast_active_screen"
      className="w-full min-h-screen bg-slate-50/50 flex flex-col justify-between"
    >
      {/* Top Header */}
      <div className="px-5 pt-3 pb-2 bg-white border-b border-slate-100 shrink-0">
        <div className="flex items-center justify-between">
          <button
            type="button"
            data-testid="broadcast_active_back_button"
            onClick={goBack}
            className="w-10 h-10 flex items-center justify-center rounded-full text-slate-700 hover:bg-slate-100 active:scale-95 transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            data-testid="teacher_avatar_button"
            onClick={openProfileSheet}
            className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#C25E1A] to-[#E08A3C] flex items-center justify-center text-white shadow-sm hover:scale-105 active:scale-95 transition cursor-pointer"
          >
            <User className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600" />
            </span>
            <span className="text-[11px] font-extrabold tracking-wider text-red-600 uppercase">
              Broadcasting Active
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-orange-200 bg-orange-50 text-orange-900 text-[11px] font-bold">
            <KeyRound className="w-3.5 h-3.5 text-orange-600" />
            <span>PIN: {uiState.broadcastPin || '47'}</span>
          </div>
        </div>

        <div className="mt-2">
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-semibold">
            <span>CS401</span>
            <span>·</span>
            <span>Room FB</span>
          </div>
          <h2 className="text-[18px] font-extrabold text-slate-900 tracking-tight">
            Database Management Systems
          </h2>
          <p className="text-[12px] text-slate-500 font-medium">Instructor: Dr. Eleanor Vance</p>
        </div>
      </div>

      {/* Center Animated Timer Ring */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-3 relative">
        <div className="relative w-[260px] h-[260px] flex items-center justify-center">
          {/* Animated radio wave ripples */}
          <div className="absolute inset-0 rounded-full border-2 border-orange-400/25 animate-ripple" />
          <div className="absolute inset-3 rounded-full border border-orange-400/15 animate-ping opacity-30" />

          {/* SVG Progress Circle */}
          <svg className="w-[250px] h-[250px] transform -rotate-90">
            {/* Background Track */}
            <circle
              cx="125"
              cy="125"
              r={circleRadius}
              stroke="#FFEDD5"
              strokeWidth="12"
              fill="transparent"
            />
            {/* Active Sweep Arc with smooth transition */}
            <circle
              cx="125"
              cy="125"
              r={circleRadius}
              stroke={isLowTime ? '#EF4444' : '#D97728'}
              strokeWidth="12"
              strokeLinecap="round"
              fill="transparent"
              strokeDasharray={circumference}
              style={{
                strokeDashoffset,
                transition: 'stroke-dashoffset 1s linear, stroke 300ms ease'
              }}
            />
          </svg>

          {/* Inner Content */}
          <div className="absolute flex flex-col items-center text-center">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>
                {uiState.currentAttendanceCount} / {uiState.totalAttendanceTarget} Present
              </span>
            </div>

            <div
              className={`text-[46px] font-black font-mono leading-none my-2 tracking-tight transition-colors duration-300 ${
                isLowTime ? 'text-red-600 animate-pulse' : 'text-slate-900'
              }`}
            >
              {minutes}:{seconds}
            </div>

            <span className="text-[10px] font-extrabold tracking-[2px] text-[#D97728] uppercase">
              Window Remaining
            </span>

            <div className="flex items-center gap-1.5 mt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] text-slate-500 font-semibold">Proximity Beacon Live</span>
            </div>
          </div>
        </div>

        {/* Live Recent Student Check-ins Ticker */}
        {uiState.recentJoins.length > 0 && (
          <div className="w-full max-w-sm mt-4">
            <div
              onClick={() => setShowRecentJoinsList(!showRecentJoinsList)}
              className="w-full rounded-2xl bg-white border border-slate-200/80 shadow-xs px-3.5 py-2 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition active:scale-98"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-ping" />
                <span className="text-[11px] font-semibold text-slate-700 truncate">
                  Latest: {uiState.recentJoins[0]}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-[#D97728] shrink-0 ml-2">
                <span>{showRecentJoinsList ? 'Hide' : 'All Joins'}</span>
                {showRecentJoinsList ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </div>
            </div>

            {showRecentJoinsList && (
              <div className="mt-2 rounded-2xl bg-white border border-slate-200 p-3 space-y-1.5 shadow-md animate-in slide-in-from-top-2 duration-200 max-h-36 overflow-y-auto">
                {uiState.recentJoins.map((joinInfo, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0">
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span>{joinInfo}</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 font-bold">Verified</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <p className="text-[11px] text-slate-400 text-center max-w-xs mt-3 px-3">
          Students inside the classroom can now enter PIN <strong>{uiState.broadcastPin || '47'}</strong> to verify attendance.
        </p>
      </div>

      {/* Bottom Action Controls */}
      <div className="px-5 py-4 bg-white border-t border-slate-100 flex flex-col gap-2 shrink-0">
        <button
          type="button"
          data-testid="stop_broadcast_early_button"
          onClick={stopBroadcastTimer}
          className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-98 transition cursor-pointer"
        >
          <Square className="w-3.5 h-3.5 text-slate-600 fill-slate-600" />
          <span>Stop Timer Early</span>
        </button>

        <button
          type="button"
          data-testid="end_session_view_report_button"
          onClick={() => navigateTo('TEACHER_REPORT')}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-[#D97728] to-[#C25E1A] hover:from-[#C25E1A] hover:to-[#A34B16] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 active:scale-98 transition cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>End Session & View Attendance Report</span>
        </button>
      </div>
    </div>
  );
};
