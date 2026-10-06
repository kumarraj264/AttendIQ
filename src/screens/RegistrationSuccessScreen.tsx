import React from 'react';
import { ArrowLeft, User, Check, ArrowRight, Mail } from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';

export const RegistrationSuccessScreen: React.FC = () => {
  const { uiState, goBack, navigateTo, setAuthTab, openProfileSheet } = useAttendance();

  const recoveryEmail = uiState.currentRole === 'TEACHER' ? uiState.teacherRegEmail : uiState.studentRegEmail;

  const handleProceed = () => {
    setAuthTab('LOGIN');
    navigateTo('AUTH');
  };

  return (
    <div
      data-testid="registration_success_screen"
      className="w-full min-h-screen bg-white flex flex-col justify-between"
    >
      {/* Header */}
      <div className="w-full flex items-center justify-between px-4 py-3">
        <button
          type="button"
          data-testid="success_back_button"
          onClick={goBack}
          className="w-11 h-11 flex items-center justify-center rounded-full text-slate-700 hover:bg-slate-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <button
          type="button"
          data-testid="success_avatar_button"
          onClick={openProfileSheet}
          className="w-[34px] h-[34px] rounded-full border border-amber-500/40 bg-amber-50 flex items-center justify-center text-amber-700 shadow-xs"
        >
          <User className="w-4 h-4" />
        </button>
      </div>

      {/* Centered Body */}
      <div className="flex-1 w-full max-w-sm mx-auto px-7 flex flex-col items-center justify-center text-center py-6">
        {/* Big Circular Success Icon */}
        <div className="w-[86px] h-[86px] rounded-full bg-emerald-100/60 p-2 flex items-center justify-center">
          <div className="w-[58px] h-[58px] rounded-full bg-[#059669] flex items-center justify-center text-white shadow-md">
            <Check className="w-8 h-8" />
          </div>
        </div>

        <h2 className="text-[20px] font-bold text-slate-900 mt-6">
          Registration Successful
        </h2>

        <p className="text-[12px] text-slate-500 mt-2 px-4 leading-relaxed">
          Your account has been created and verified. Your credentials have been linked for instant email recovery.
        </p>

        {recoveryEmail && (
          <div className="w-full mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs text-slate-600 flex items-center gap-2.5 shadow-xs">
            <Mail className="w-4 h-4 text-slate-500 shrink-0" />
            <div className="truncate text-[11px]">
              <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">Password Recovery Email</span>
              <span className="font-semibold text-slate-800 truncate block">
                {recoveryEmail}
              </span>
            </div>
          </div>
        )}

        {/* Account Status Box */}
        <div className="w-full mt-4 rounded-xl border border-slate-200 bg-white p-3.5 text-left shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold tracking-wider text-slate-400 block">
              ACCOUNT STATUS
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-[#059669]" />
              <span className="text-[12px] font-semibold text-[#059669]">Active & Verified</span>
            </div>
          </div>

          <div className="w-5 h-5 rounded-full bg-[#059669] flex items-center justify-center text-white">
            <Check className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Footer Action Button */}
      <div className="w-full px-6 py-7">
        <button
          type="button"
          data-testid="proceed_to_login_button"
          onClick={handleProceed}
          className="w-full h-12 rounded-lg bg-[#127038] hover:bg-[#0E582C] text-white text-[13px] font-semibold flex items-center justify-center gap-1.5 shadow-md transition-colors cursor-pointer"
        >
          <span>Proceed to Log In</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

