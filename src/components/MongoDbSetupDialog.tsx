import React, { useState, useEffect } from 'react';
import { X, Database, RefreshCw, KeyRound, ExternalLink } from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';

export const MongoDbSetupDialog: React.FC = () => {
  const { uiState, closeMongoDbInfo } = useAttendance();
  const [mongoUri, setMongoUri] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [status, setStatus] = useState<{
    connected: boolean;
    dbName: string;
    hasUriConfigured: boolean;
    error: string | null;
    storageType: string;
  } | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!uiState.isMongoDbInfoOpen) return;
    fetchStatus();
  }, [uiState.isMongoDbInfoOpen]);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/mongodb/status');
      const data = await res.json();
      setStatus(data);
    } catch {
      setStatus(null);
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mongoUri.trim()) return;

    setIsConnecting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/mongodb/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uri: mongoUri.trim() })
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ text: 'Connected to MongoDB Atlas successfully! All records will now save to cloud.', type: 'success' });
        fetchStatus();
      } else {
        setMessage({ text: data.message || 'Connection failed. Please check your credentials.', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err?.message || 'Network error connecting to backend', type: 'error' });
    } finally {
      setIsConnecting(false);
    }
  };

  if (!uiState.isMongoDbInfoOpen) return null;

  return (
    <div
      data-testid="mongodb_setup_dialog"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={closeMongoDbInfo}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl p-5 shadow-2xl flex flex-col gap-4 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Deploy with MongoDB Atlas
              </h3>
              <p className="text-xs text-slate-500">Live Cloud Database & Central Campus Sync</p>
            </div>
          </div>
          <button
            onClick={closeMongoDbInfo}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Connection Status Badge */}
        <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
          status?.connected
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${status?.connected ? 'bg-emerald-600 animate-pulse' : 'bg-amber-600'}`} />
            <div>
              <p className="font-bold">
                {status?.connected ? 'Connected to MongoDB Atlas' : 'Local Fallback Storage Active'}
              </p>
              <p className="text-[11px] opacity-80">
                {status?.connected
                  ? `Database: ${status.dbName} (Cloud Managed)`
                  : 'Currently storing data locally in /data/attendiq_db.json'}
              </p>
            </div>
          </div>
          <button
            onClick={fetchStatus}
            className="p-1 hover:bg-black/5 rounded text-slate-600 transition"
            title="Refresh status"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Live Connect Form */}
        <form onSubmit={handleConnect} className="space-y-2.5">
          <label className="block text-xs font-bold text-slate-800">
            Paste MongoDB Atlas Connection String
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              value={mongoUri}
              onChange={(e) => setMongoUri(e.target.value)}
              placeholder="mongodb+srv://<user>:<password>@cluster0.mongodb.net/attendiq"
              className="flex-1 h-10 px-3 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={isConnecting || !mongoUri.trim()}
              className="px-4 h-10 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
            >
              {isConnecting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
              <span>{isConnecting ? 'Connecting...' : 'Connect'}</span>
            </button>
          </div>

          {message && (
            <div className={`p-2.5 rounded-lg text-xs font-medium ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}
        </form>

        {/* Step-by-Step Guide */}
        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs space-y-2">
          <div className="flex items-center justify-between font-bold text-slate-800">
            <span>How to get your free MongoDB Atlas URI:</span>
            <a
              href="https://cloud.mongodb.com"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-700 hover:underline flex items-center gap-1 text-[11px]"
            >
              <span>cloud.mongodb.com</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px]">
            <li>Sign in to <strong>cloud.mongodb.com</strong> and create a free <strong>M0 Shared Cluster</strong>.</li>
            <li>Go to <strong>Database Access</strong> → Add user with username & password.</li>
            <li>Go to <strong>Network Access</strong> → Add IP Address → Choose <strong>"Allow Access from Anywhere" (0.0.0.0/0)</strong>.</li>
            <li>Click <strong>Connect</strong> on your Cluster → Choose <strong>"Drivers (Node.js)"</strong>.</li>
            <li>Copy the connection string, replace <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">&lt;password&gt;</code> with your database password, and paste above!</li>
          </ol>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={closeMongoDbInfo}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
