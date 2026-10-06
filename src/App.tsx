import React, { useState } from 'react';
import { AttendanceProvider, useAttendance } from './context/AttendanceContext';
import { RoleSelectionScreen } from './screens/RoleSelectionScreen';
import { AuthScreen } from './screens/AuthScreen';
import { DocumentVerificationScreen } from './screens/DocumentVerificationScreen';
import { RegistrationSuccessScreen } from './screens/RegistrationSuccessScreen';
import { TeacherBroadcastSetupScreen } from './screens/TeacherBroadcastSetupScreen';
import { TeacherBroadcastActiveScreen } from './screens/TeacherBroadcastActiveScreen';
import { StudentAttendanceScreen } from './screens/StudentAttendanceScreen';
import { TeacherReportScreen } from './screens/TeacherReportScreen';
import { TargetedAttendanceAlert } from './components/TargetedAttendanceAlert';
import { ProfileBottomSheet } from './components/ProfileBottomSheet';
import { DocPreviewDialog } from './components/DocPreviewDialog';
import { ExportCsvDialog } from './components/ExportCsvDialog';
import { MongoDbSetupDialog } from './components/MongoDbSetupDialog';
import { MobileTestingModal } from './components/MobileTestingModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  QrCode,
  Download,
  Wifi,
  Battery,
  Maximize2,
  Minimize2
} from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    uiState,
    acceptIncomingSessionAlert,
    dismissIncomingAlert
  } = useAttendance();

  const [isMobileTestOpen, setIsMobileTestOpen] = useState(false);
  const [isMobileFrameActive, setIsMobileFrameActive] = useState(true);

  const renderScreen = () => {
    switch (uiState.currentScreen) {
      case 'ROLE_SELECTION':
        return <RoleSelectionScreen />;
      case 'AUTH':
        return <AuthScreen />;
      case 'DOC_VERIFICATION':
        return <DocumentVerificationScreen />;
      case 'REGISTRATION_SUCCESS':
        return <RegistrationSuccessScreen />;
      case 'TEACHER_BROADCAST_SETUP':
        return <TeacherBroadcastSetupScreen />;
      case 'TEACHER_BROADCAST_ACTIVE':
        return <TeacherBroadcastActiveScreen />;
      case 'STUDENT_ATTENDANCE':
        return <StudentAttendanceScreen />;
      case 'TEACHER_REPORT':
        return <TeacherReportScreen />;
      default:
        return <RoleSelectionScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col justify-center items-center p-0 sm:p-4 select-none relative overflow-x-hidden">
      {/* Offline Status Warning */}
      <OfflineIndicator />

      {/* Top Floating Mobile Testing Bar */}
      <div className="flex flex-wrap items-center justify-center gap-2 py-2 px-3 sm:py-0 sm:mb-3 z-30 max-w-full">
        <button
          onClick={() => setIsMobileTestOpen(true)}
          className="px-3 py-1.5 rounded-full bg-teal-600/95 hover:bg-teal-500 text-white font-semibold text-xs shadow-lg flex items-center gap-1.5 backdrop-blur-md border border-teal-400/30 transition hover:scale-105 active:scale-95 cursor-pointer"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Test on Mobile / QR</span>
        </button>

        <button
          onClick={() => setIsMobileTestOpen(true)}
          className="px-3 py-1.5 rounded-full bg-amber-600/95 hover:bg-amber-500 text-white font-semibold text-xs shadow-lg flex items-center gap-1.5 backdrop-blur-md border border-amber-400/30 transition hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Android APK (22 MB)</span>
        </button>

        <button
          onClick={() => setIsMobileFrameActive(!isMobileFrameActive)}
          className="hidden sm:flex px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-medium items-center gap-1.5 border border-white/10 transition cursor-pointer"
          title="Toggle Mobile Simulator Frame"
        >
          {isMobileFrameActive ? (
            <>
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Full Width</span>
            </>
          ) : (
            <>
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Device Frame</span>
            </>
          )}
        </button>
      </div>

      {/* Mobile Device Container */}
      <div
        className={`w-full transition-all duration-300 relative flex flex-col bg-white overflow-hidden ${
          isMobileFrameActive
            ? 'max-w-md min-h-screen sm:min-h-[844px] sm:max-h-[920px] sm:rounded-[44px] sm:border-[10px] sm:border-slate-800 sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)]'
            : 'max-w-xl min-h-screen sm:rounded-2xl sm:shadow-2xl'
        }`}
      >
        {/* Realistic Mobile Status Bar (Simulated on frame mode) */}
        {isMobileFrameActive && (
          <div className="hidden sm:flex items-center justify-between px-6 pt-3 pb-1 bg-white text-slate-800 text-[11px] font-semibold shrink-0 z-20">
            <span>9:41</span>
            {/* Dynamic Island / Speaker Pill */}
            <div className="w-24 h-4 bg-slate-900 rounded-full flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="w-2 h-2 rounded-full bg-slate-700" />
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="text-[10px] font-bold">5G</span>
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>
        )}

        {/* Floating Targeted Attendance Alert */}
        <div className="absolute top-2 inset-x-2 z-30 pointer-events-auto">
          <TargetedAttendanceAlert
            subjectCode={uiState.incomingSubjectCode}
            subjectName={uiState.incomingSubjectName}
            isVisible={uiState.isIncomingSessionAlertVisible}
            onAccept={acceptIncomingSessionAlert}
            onDismiss={dismissIncomingAlert}
          />
        </div>

        {/* Current Active Screen with Smooth Page Enter Animation */}
        <div
          key={uiState.currentScreen}
          className="flex-1 flex flex-col relative w-full h-full overflow-hidden animate-page-enter"
        >
          {renderScreen()}
        </div>

        {/* Bottom Home Indicator Bar (Simulated frame mode) */}
        {isMobileFrameActive && (
          <div className="hidden sm:flex justify-center items-center py-2 bg-white shrink-0 z-20">
            <div className="w-32 h-1 bg-slate-300 rounded-full" />
          </div>
        )}

        {/* Modals & Dialogs */}
        <ProfileBottomSheet />
        <DocPreviewDialog />
        <ExportCsvDialog />
        <MongoDbSetupDialog />
        <MobileTestingModal
          isOpen={isMobileTestOpen}
          onClose={() => setIsMobileTestOpen(false)}
          isMobileFrameActive={isMobileFrameActive}
          onToggleMobileFrame={() => setIsMobileFrameActive(!isMobileFrameActive)}
        />
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AttendanceProvider>
      <AppContent />
    </AttendanceProvider>
  );
};

export default App;
