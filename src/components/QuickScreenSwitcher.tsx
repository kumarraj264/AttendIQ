import React, { useState } from 'react';
import { Grid, X, Smartphone, QrCode } from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';
import { Screen, Role, AuthTab } from '../types';

interface QuickScreenSwitcherProps {
  onOpenMobileTest?: () => void;
}

export const QuickScreenSwitcher: React.FC<QuickScreenSwitcherProps> = ({ onOpenMobileTest }) => {
  const { uiState, navigateTo, selectRole, setAuthTab } = useAttendance();
  const [isExpanded, setIsExpanded] = useState(false);

  if (uiState.currentScreen === 'ROLE_SELECTION' && !isExpanded) {
    return null;
  }

  const isCurrent = (screen: Screen, role?: Role, authTab?: AuthTab) => {
    if (uiState.currentScreen !== screen) return false;
    if (role && uiState.currentRole !== role) return false;
    if (authTab && uiState.authTab !== authTab) return false;
    return true;
  };

  return (
    <div className="fixed bottom-3 inset-x-0 z-40 flex flex-col items-center pointer-events-none px-3">
      {isExpanded ? (
        <div className="pointer-events-auto w-full max-w-xl bg-[#0B1528] border border-white/20 rounded-2xl p-3 shadow-2xl animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-[10px] font-bold tracking-wider text-white/80">
              PREVIEW SCREENS (12 Mockups)
            </span>
            <div className="flex items-center gap-2">
              {onOpenMobileTest && (
                <button
                  onClick={onOpenMobileTest}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-[10px] font-bold border border-teal-500/30 transition"
                  title="Test on Mobile with QR code or download APK"
                >
                  <QrCode className="w-3 h-3" />
                  <span>Test on Mobile</span>
                </button>
              )}
              <button
                onClick={() => setIsExpanded(false)}
                className="text-white/70 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Row 1 */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
            <button
              onClick={() => navigateTo('ROLE_SELECTION')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
                isCurrent('ROLE_SELECTION') ? 'bg-[#0F87AC] text-white font-bold' : 'bg-white/10 text-white/90 hover:bg-white/20'
              }`}
            >
              1. Role Select
            </button>
            <button
              onClick={() => {
                selectRole('STUDENT');
                setAuthTab('LOGIN');
              }}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
                isCurrent('AUTH', 'STUDENT', 'LOGIN') ? 'bg-[#0F87AC] text-white font-bold' : 'bg-white/10 text-white/90 hover:bg-white/20'
              }`}
            >
              2. Student Login
            </button>
            <button
              onClick={() => {
                selectRole('TEACHER');
                setAuthTab('LOGIN');
              }}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
                isCurrent('AUTH', 'TEACHER', 'LOGIN') ? 'bg-[#0F87AC] text-white font-bold' : 'bg-white/10 text-white/90 hover:bg-white/20'
              }`}
            >
              3. Teacher Login
            </button>
            <button
              onClick={() => {
                selectRole('STUDENT');
                setAuthTab('REGISTER');
              }}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
                isCurrent('AUTH', 'STUDENT', 'REGISTER') ? 'bg-[#0F87AC] text-white font-bold' : 'bg-white/10 text-white/90 hover:bg-white/20'
              }`}
            >
              4. Student Reg 1/2
            </button>
            <button
              onClick={() => {
                selectRole('TEACHER');
                setAuthTab('REGISTER');
              }}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
                isCurrent('AUTH', 'TEACHER', 'REGISTER') ? 'bg-[#0F87AC] text-white font-bold' : 'bg-white/10 text-white/90 hover:bg-white/20'
              }`}
            >
              5. Teacher Reg 1/2
            </button>
          </div>

          {/* Row 2 */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 scrollbar-none">
            <button
              onClick={() => {
                selectRole('STUDENT');
                navigateTo('DOC_VERIFICATION');
              }}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
                isCurrent('DOC_VERIFICATION', 'STUDENT') ? 'bg-[#0F87AC] text-white font-bold' : 'bg-white/10 text-white/90 hover:bg-white/20'
              }`}
            >
              6. Student Doc Verify
            </button>
            <button
              onClick={() => {
                selectRole('TEACHER');
                navigateTo('DOC_VERIFICATION');
              }}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
                isCurrent('DOC_VERIFICATION', 'TEACHER') ? 'bg-[#0F87AC] text-white font-bold' : 'bg-white/10 text-white/90 hover:bg-white/20'
              }`}
            >
              7. Teacher Doc Upload
            </button>
            <button
              onClick={() => navigateTo('REGISTRATION_SUCCESS')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
                isCurrent('REGISTRATION_SUCCESS') ? 'bg-[#0F87AC] text-white font-bold' : 'bg-white/10 text-white/90 hover:bg-white/20'
              }`}
            >
              8. Reg Successful
            </button>
            <button
              onClick={() => navigateTo('TEACHER_BROADCAST_SETUP')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
                isCurrent('TEACHER_BROADCAST_SETUP') ? 'bg-[#0F87AC] text-white font-bold' : 'bg-white/10 text-white/90 hover:bg-white/20'
              }`}
            >
              9. Teacher PIN Broadcast
            </button>
            <button
              onClick={() => navigateTo('TEACHER_BROADCAST_ACTIVE')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
                isCurrent('TEACHER_BROADCAST_ACTIVE') ? 'bg-[#0F87AC] text-white font-bold' : 'bg-white/10 text-white/90 hover:bg-white/20'
              }`}
            >
              10. Broadcast Active
            </button>
            <button
              onClick={() => navigateTo('STUDENT_ATTENDANCE')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
                isCurrent('STUDENT_ATTENDANCE') ? 'bg-[#0F87AC] text-white font-bold' : 'bg-white/10 text-white/90 hover:bg-white/20'
              }`}
            >
              11. Student PIN Entry
            </button>
            <button
              onClick={() => navigateTo('TEACHER_REPORT')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
                isCurrent('TEACHER_REPORT') ? 'bg-[#0F87AC] text-white font-bold' : 'bg-white/10 text-white/90 hover:bg-white/20'
              }`}
            >
              12. Attendance Report
            </button>
          </div>
        </div>
      ) : (
        <div className="pointer-events-auto flex items-center gap-2">
          {onOpenMobileTest && (
            <button
              type="button"
              data-testid="mobile_test_toggle"
              onClick={onOpenMobileTest}
              className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white shadow-lg flex items-center gap-1.5 text-[11px] font-bold transition-all hover:scale-105 active:scale-95 border border-teal-400/30"
            >
              <Smartphone className="w-3.5 h-3.5 text-teal-200" />
              <span>Test on Mobile</span>
            </button>
          )}
          <button
            type="button"
            data-testid="quick_nav_toggle"
            onClick={() => setIsExpanded(true)}
            className="px-3.5 py-1.5 rounded-full bg-white/95 hover:bg-white border border-slate-200 text-slate-700 shadow-md flex items-center gap-1.5 text-[11px] font-semibold transition-all hover:scale-105 active:scale-95"
          >
            <Grid className="w-3.5 h-3.5 text-slate-600" />
            <span>Screens</span>
          </button>
        </div>
      )}
    </div>
  );
};
