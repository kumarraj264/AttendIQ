import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-2 inset-x-4 z-50 flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xl animate-in slide-in-from-top duration-200">
      <WifiOff className="w-4 h-4 animate-pulse" />
      <span>Offline Mode — Cached local data is in use</span>
    </div>
  );
};
