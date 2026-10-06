import React from 'react';
import {
  X,
  User,
  MapPin,
  Shield,
  Bluetooth,
  Database,
  ArrowLeftRight,
  Download,
  Bot
} from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';
import { downloadApkSafely } from '../utils/apkDownload';

export const ProfileBottomSheet: React.FC = () => {
  const {
    uiState,
    closeProfileSheet,
    toggleCampusGeofence,
    openMongoDbInfo,
    switchRole,
    navigateTo
  } = useAttendance();

  if (!uiState.isProfileSheetOpen) return null;

  const isTeacher = uiState.currentRole === 'TEACHER';
  const brandColor = isTeacher ? '#D97728' : '#0F87AC';
  const brandBg = isTeacher ? 'bg-[#FFF7ED]' : 'bg-[#E8F5F8]';
  const brandBorder = isTeacher ? 'border-[#FED7AA]' : 'border-[#CBEAF4]';

  return (
    <div
      data-testid="profile_bottom_sheet"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs transition-opacity"
      onClick={closeProfileSheet}
    >
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab Handle Affordance */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-3 shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3">
          <h3 className="text-[15px] font-bold text-slate-900">
            GGU Attendance Security & Sensors
          </h3>
          <button
            onClick={closeProfileSheet}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info Card */}
        <div className={`w-full rounded-xl ${brandBg} border ${brandBorder} p-3.5 my-2`}>
          <div className="flex items-center gap-3.5">
            <div
              className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-white shrink-0 shadow-sm"
              style={{ backgroundColor: brandColor }}
            >
              <User className="w-7 h-7" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[14.5px] font-bold text-slate-900 truncate">
                  {isTeacher ? 'Dr. Eleanor Vance' : 'Alex Morgan'}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[9px] font-bold border border-emerald-200">
                  GGU Active
                </span>
              </div>
              <p className="text-[11px] text-slate-600 truncate mt-0.5">
                {isTeacher
                  ? 'FAC-CS-8924 • Dept of CSIT, GGU Bilaspur'
                  : '2024-BTECH-CS-042 • CSIT Dept, GGU Bilaspur'}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                {isTeacher
                  ? 'Course: CS401 (DBMS) + CS405 + SEC201'
                  : 'Courses: Major (CS401), Minor (CS405), SEC, VAC, AEC'}
              </p>
            </div>
          </div>
        </div>

        {/* Anti-Proxy and Location Section */}
        <div className="mt-3">
          <div className="text-[10px] font-bold tracking-wider text-slate-400 mb-2">
            ANTI-PROXY & LOCATION VERIFICATION
          </div>

          <div className="border border-slate-200 rounded-xl bg-white p-3 divide-y divide-slate-100">
            {/* GGU Bilaspur Campus GPS Geofence */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-red-600 shrink-0" />
                <div>
                  <div className="text-[12px] font-semibold text-slate-800">
                    GGU Bilaspur Campus GPS
                  </div>
                  <div
                    className={`text-[10px] font-medium ${
                      uiState.campusGeofence.isWithinBoundary ? 'text-emerald-700' : 'text-red-600'
                    }`}
                  >
                    {uiState.campusGeofence.isWithinBoundary
                      ? `Inside Campus (${uiState.campusGeofence.currentDistanceMeters | 0}m from Center)`
                      : `Outside Campus Boundary (${uiState.campusGeofence.currentDistanceMeters | 0}m away - BLOCKED)`}
                  </div>
                </div>
              </div>

              {/* Simulation switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  data-testid="toggle_geofence_switch"
                  checked={uiState.campusGeofence.isWithinBoundary}
                  onChange={toggleCampusGeofence}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0F87AC]" />
              </label>
            </div>

            {/* Teacher Headcount Audit */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-[#D97728] shrink-0" />
                <div>
                  <div className="text-[12px] font-semibold text-slate-800">
                    Teacher Headcount Audit
                  </div>
                  <div className="text-[10px] font-medium text-emerald-700">
                    Sir can cross-check physical count & cancel proxy in 1-tap
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-600">Active</span>
            </div>

            {/* Classroom BLE Gateway */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2.5">
                <Bluetooth className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <div className="text-[12px] font-semibold text-slate-800">
                    Classroom BLE Gateway (CSIT)
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Room FB Gateway Active • No Mic Hardware Dependency
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-600">Linked</span>
            </div>
          </div>
        </div>

        {/* Download Android APK Button */}
        <button
          type="button"
          onClick={async () => {
            await downloadApkSafely();
          }}
          className="mt-3.5 w-full h-11 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-[12px] font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <Bot className="w-4 h-4" />
          <span>Download Latest Android APK (23 MB)</span>
          <Download className="w-3.5 h-3.5 opacity-80" />
        </button>

        {/* View MongoDB Setup Button */}
        <button
          type="button"
          data-testid="view_mongodb_button"
          onClick={() => {
            closeProfileSheet();
            openMongoDbInfo();
          }}
          className="mt-2.5 w-full h-10 rounded-lg border border-emerald-600 text-emerald-700 text-[11.5px] font-bold flex items-center justify-center gap-2 hover:bg-emerald-50 transition-colors cursor-pointer"
        >
          <Database className="w-4 h-4 text-emerald-600" />
          <span>View MongoDB Schema & Architecture Plan</span>
        </button>

        {/* Role Switch & Logout Buttons */}
        <div className="mt-3.5 flex items-center gap-2.5">
          <button
            type="button"
            data-testid="profile_switch_role_btn"
            onClick={() => {
              switchRole();
              closeProfileSheet();
            }}
            className="flex-1 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <ArrowLeftRight className="w-4 h-4 text-slate-700" />
            <span>Switch Role</span>
          </button>

          <button
            type="button"
            data-testid="profile_logout_btn"
            onClick={() => {
              navigateTo('ROLE_SELECTION');
              closeProfileSheet();
            }}
            style={{ backgroundColor: brandColor }}
            className="flex-1 h-11 rounded-lg text-white text-[12px] font-semibold flex items-center justify-center hover:opacity-90 transition-opacity"
          >
            Change Role / Logout
          </button>
        </div>
      </div>
    </div>
  );
};
