import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Smartphone,
  QrCode,
  Download,
  Copy,
  Check,
  X,
  Sparkles,
  Info,
  Apple,
  Bot,
  Usb,
  Terminal,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { downloadApkSafely } from '../utils/apkDownload';

interface MobileTestingModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMobileFrameActive: boolean;
  onToggleMobileFrame: () => void;
}

export const MobileTestingModal: React.FC<MobileTestingModalProps> = ({
  isOpen,
  onClose,
  isMobileFrameActive,
  onToggleMobileFrame,
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [qrApkDataUrl, setQrApkDataUrl] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedApkUrl, setCopiedApkUrl] = useState(false);
  const [copiedAdbCmd, setCopiedAdbCmd] = useState<string | null>(null);
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'scan' | 'adb' | 'apk' | 'pwa' | 'frame'>('scan');
  const { isInstallable, isIOS, install } = usePWAInstall();

  // App URLs
  const currentUrl =
    typeof window !== 'undefined'
      ? window.location.href.split('?')[0]
      : 'https://ais-pre-qg2dzijkh2qfvujzs6vjgg-45112734722.asia-southeast1.run.app';

  const originUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://ais-pre-qg2dzijkh2qfvujzs6vjgg-45112734722.asia-southeast1.run.app';

  const apkDownloadUrl = `${originUrl}/app-debug.apk`;

  const curlDownloadCmd = `curl -O "${apkDownloadUrl}"`;
  const adbInstallCmd = `adb install -r app-debug.apk`;
  const adbLaunchCmd = `adb shell monkey -p com.aistudio.attendiq.vzkxqy -c android.intent.category.LAUNCHER 1`;

  useEffect(() => {
    if (!isOpen) return;
    QRCode.toDataURL(currentUrl, {
      width: 280,
      margin: 2,
      color: {
        dark: '#0F87AC',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error('Error generating QR code:', err));

    QRCode.toDataURL(apkDownloadUrl, {
      width: 280,
      margin: 2,
      color: {
        dark: '#B45309',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrApkDataUrl(url))
      .catch((err) => console.error('Error generating APK QR code:', err));
  }, [isOpen, currentUrl, apkDownloadUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleCopyApkLink = () => {
    navigator.clipboard.writeText(apkDownloadUrl);
    setCopiedApkUrl(true);
    setTimeout(() => setCopiedApkUrl(false), 2500);
  };

  const handleCopyCommand = (cmd: string, key: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedAdbCmd(key);
    setTimeout(() => setCopiedAdbCmd(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-amber-600 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Usb className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Install & Test on Mobile</h2>
              <p className="text-xs text-teal-100">USB Debugging (ADB), Native APK & Live Web</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold shrink-0 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('scan')}
            className={`flex-1 py-3 px-3 flex items-center justify-center gap-1.5 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'scan'
                ? 'border-teal-600 text-teal-700 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Scan QR Code</span>
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`flex-1 py-3 px-3 flex items-center justify-center gap-1.5 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'apk'
                ? 'border-amber-600 text-amber-700 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Download APK</span>
          </button>
          <button
            onClick={() => setActiveTab('adb')}
            className={`flex-1 py-3 px-3 flex items-center justify-center gap-1.5 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'adb'
                ? 'border-amber-600 text-amber-700 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Usb className="w-3.5 h-3.5" />
            <span>USB Debugging (ADB)</span>
          </button>
          <button
            onClick={() => setActiveTab('pwa')}
            className={`flex-1 py-3 px-3 flex items-center justify-center gap-1.5 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'pwa'
                ? 'border-teal-600 text-teal-700 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>PWA / Install</span>
          </button>
          <button
            onClick={() => setActiveTab('frame')}
            className={`flex-1 py-3 px-3 flex items-center justify-center gap-1.5 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'frame'
                ? 'border-slate-800 text-slate-900 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Simulator</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* TAB: USB DEBUGGING (ADB) */}
          {activeTab === 'adb' && (
            <div className="space-y-4">
              {/* Introduction Banner */}
              <div className="flex items-start gap-3 p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-950">
                <Usb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold">Install via USB Debugging (Android Debug Bridge)</p>
                  <p className="text-amber-800">
                    Follow the 4 simple steps below to push and install <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">app-debug.apk</code> directly from your laptop to your connected Android phone.
                  </p>
                </div>
              </div>

              {/* Step 1: Download APK to Laptop */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[11px]">1</span>
                    Download APK to your Computer
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">22.4 MB</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => downloadApkSafely(setDownloadStatus)}
                    className="flex-1 py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download app-debug.apk</span>
                  </button>

                  <button
                    onClick={() => handleCopyCommand(curlDownloadCmd, 'curl')}
                    className="py-2 px-3 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-mono flex items-center justify-center gap-1.5 transition"
                    title="Copy terminal curl command"
                  >
                    <Terminal className="w-3.5 h-3.5 text-slate-500" />
                    <span>{copiedAdbCmd === 'curl' ? 'Copied curl!' : 'Copy curl'}</span>
                  </button>
                </div>
              </div>

              {/* Step 2: Enable USB Debugging on Phone */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[11px]">2</span>
                  Enable USB Debugging on your Android Phone
                </span>
                <ol className="list-decimal list-inside text-xs text-slate-600 space-y-1 pl-1">
                  <li>Open phone <strong>Settings → About phone</strong>.</li>
                  <li>Tap <strong>Build number</strong> 7 times continuously until you see <em>"You are now a developer!"</em>.</li>
                  <li>Go back to <strong>Settings → System (or Additional settings) → Developer options</strong>.</li>
                  <li>Turn <strong>ON</strong> <strong className="text-slate-900">USB Debugging</strong>.</li>
                  <li className="text-amber-800">
                    <em>(For Xiaomi/Redmi/Poco/Realme):</em> Also toggle ON <strong>"Install via USB"</strong>.
                  </li>
                </ol>
              </div>

              {/* Step 3: Connect USB & Authorize */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[11px]">3</span>
                  Connect Phone & Authorize
                </span>
                <p className="text-xs text-slate-600">
                  Connect your phone to your computer with a USB cable. On your phone screen, when prompted with <strong>"Allow USB debugging?"</strong>, check <em>"Always allow from this computer"</em> and tap <strong>Allow</strong>.
                </p>
                <div className="flex items-center justify-between p-2 bg-slate-900 text-slate-200 rounded-lg text-xs font-mono">
                  <span>adb devices</span>
                  <button
                    onClick={() => handleCopyCommand('adb devices', 'devices')}
                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
                    title="Copy command"
                  >
                    {copiedAdbCmd === 'devices' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Step 4: Run ADB Install */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[11px]">4</span>
                  Install APK via Terminal
                </span>
                <p className="text-xs text-slate-600">
                  In your terminal (in the folder where you downloaded <code className="font-mono">app-debug.apk</code>), run:
                </p>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between p-2.5 bg-slate-900 text-emerald-400 rounded-lg text-xs font-mono overflow-x-auto">
                    <span>{adbInstallCmd}</span>
                    <button
                      onClick={() => handleCopyCommand(adbInstallCmd, 'install')}
                      className="ml-2 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] flex items-center gap-1 transition shrink-0"
                    >
                      {copiedAdbCmd === 'install' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedAdbCmd === 'install' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-slate-900/90 text-slate-300 rounded-lg text-[11px] font-mono overflow-x-auto">
                    <span className="truncate">{adbLaunchCmd}</span>
                    <button
                      onClick={() => handleCopyCommand(adbLaunchCmd, 'launch')}
                      className="ml-2 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] flex items-center gap-1 shrink-0"
                    >
                      {copiedAdbCmd === 'launch' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Launch</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* WebADB Alternative */}
              <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 flex items-start gap-2.5 text-xs text-teal-950">
                <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold">Don't have ADB installed on your computer?</p>
                  <p className="text-teal-800">
                    You can install ADB via <code className="bg-teal-100/80 px-1 py-0.2 rounded font-mono">winget install Google.PlatformTools</code> (Windows), <code className="bg-teal-100/80 px-1 py-0.2 rounded font-mono">brew install android-platform-tools</code> (Mac), or use <strong>WebADB in Google Chrome</strong> without installing anything at all.
                  </p>
                  <a
                    href="https://app.webadb.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-teal-700 font-bold hover:underline mt-1"
                  >
                    <span>Open WebADB in Chrome</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB: DIRECT APK */}
          {activeTab === 'apk' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-amber-950">Native Android Application Package (APK)</p>
                  <p className="text-amber-800">
                    The pre-compiled debug APK is a starter binary. Note: For the <strong>100% latest live version</strong> (with required email, separate ID/timetable uploads, and email password recovery), use the <strong>"Scan QR Code"</strong> tab to install the live app on your phone!
                  </p>
                </div>
              </div>

              {/* Direct Scan on Phone QR Code */}
              <div className="flex flex-col items-center p-3.5 bg-white rounded-xl border border-slate-200 text-center space-y-2">
                <span className="text-xs font-bold text-slate-800">
                  Scan QR with your phone to download directly:
                </span>
                <div className="p-2 bg-white rounded-xl border-2 border-amber-500/20 shadow-xs">
                  {qrApkDataUrl ? (
                    <img
                      src={qrApkDataUrl}
                      alt="Scan to download APK on Android"
                      className="w-44 h-44 rounded-lg mx-auto"
                    />
                  ) : (
                    <div className="w-44 h-44 flex items-center justify-center bg-slate-50 text-slate-400 text-xs">
                      Loading QR...
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  Open your camera or Chrome on Android and point at this code to start the APK download.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">File Name:</span>
                  <span className="font-mono font-bold text-slate-700">app-debug.apk</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">File Size:</span>
                  <span className="font-semibold text-slate-700">~23.0 MB (Latest Build)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Target Platform:</span>
                  <span className="font-semibold text-slate-700">Android 9 to 15 (SDK 36)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Repository:</span>
                  <a
                    href="https://github.com/kumarraj264/AttendIQ"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-amber-700 hover:underline flex items-center gap-1"
                  >
                    kumarraj264/AttendIQ
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Application:</span>
                  <span className="font-mono text-slate-700">AttendIQ Smart Attendance</span>
                </div>
              </div>

              {/* Direct Download Button */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => downloadApkSafely(setDownloadStatus)}
                  className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Latest APK (23 MB)</span>
                </button>

                {downloadStatus && (
                  <p className="text-xs text-center font-semibold text-amber-700 animate-in fade-in">
                    {downloadStatus}
                  </p>
                )}

                {/* Direct APK URL bar & Copy Button */}
                <div className="flex items-center gap-2 p-2 bg-slate-100 rounded-xl border border-slate-200">
                  <input
                    type="text"
                    readOnly
                    value={apkDownloadUrl}
                    className="flex-1 text-xs bg-transparent text-slate-600 px-2 font-mono outline-hidden truncate"
                  />
                  <button
                    onClick={handleCopyApkLink}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer shrink-0"
                  >
                    {copiedApkUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedApkUrl ? 'Copied Link' : 'Copy APK URL'}</span>
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 space-y-1.5 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                <p className="font-bold text-slate-800">📱 How to install on your Android phone:</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-0.5">
                  <li>Download <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-amber-800">app-debug.apk</code> to your phone (tap button above or scan QR).</li>
                  <li>Open the downloaded file from Chrome notifications or your phone's <strong>Files / Downloads</strong> app.</li>
                  <li>If prompted, tap <strong>Settings</strong> and switch ON <em>"Allow from this source / Install unknown apps"</em>.</li>
                  <li>Tap <strong>Install</strong> and open AttendIQ to test the full attendance and haptic features!</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB: SCAN QR CODE */}
          {activeTab === 'scan' && (
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-white rounded-2xl border-2 border-teal-500/20 shadow-md">
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt="Scan to open on mobile"
                    className="w-56 h-56 rounded-lg"
                  />
                ) : (
                  <div className="w-56 h-56 flex items-center justify-center bg-slate-100 text-slate-400">
                    Generating QR...
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] mb-1">
                  ✨ 100% Latest Live App
                </span>
                <p className="text-sm font-bold text-slate-800">Scan to open & install on your phone</p>
                <p className="text-xs text-slate-500 max-w-xs">
                  Includes all updates: required email, password recovery, separate ID/routine uploads, and live GPS geofencing. Tap "Install App" in Chrome to add to home screen!
                </p>
              </div>

              {/* URL & Copy Link Bar */}
              <div className="w-full flex items-center gap-2 p-2 bg-slate-100 rounded-xl border border-slate-200">
                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  className="flex-1 text-xs bg-transparent text-slate-600 px-2 font-mono outline-hidden truncate"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: PWA / ADD TO HOME SCREEN */}
          {activeTab === 'pwa' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-teal-50 rounded-xl border border-teal-200 text-teal-900 text-xs">
                <p className="font-semibold text-teal-950 flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  Install as Progressive Web App (PWA)
                </p>
                <p className="text-teal-800">
                  Install AttendIQ directly from Chrome or Safari to run it fullscreen with offline support, no app store required!
                </p>
              </div>

              {/* Install button if browser triggers beforeinstallprompt */}
              {isInstallable && (
                <button
                  onClick={install}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Install App to This Device</span>
                </button>
              )}

              {/* iOS instructions */}
              <div className={`p-4 rounded-xl border space-y-2 ${isIOS ? 'bg-teal-50/60 border-teal-300 ring-2 ring-teal-500/20' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                    <Apple className="w-4 h-4 text-slate-900" />
                    <span>On iPhone & iPad (Safari):</span>
                  </div>
                  {isIOS && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-600 text-white">
                      Your Device
                    </span>
                  )}
                </div>
                <ol className="list-decimal list-inside text-xs text-slate-600 space-y-1 pl-1">
                  <li>Open the link in <strong>Safari</strong></li>
                  <li>Tap the <strong>Share</strong> button at the bottom of the screen</li>
                  <li>Scroll down and tap <strong>Add to Home Screen</strong></li>
                  <li>Tap <strong>Add</strong> in the top right corner</li>
                </ol>
              </div>

              {/* Android instructions */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                  <Bot className="w-4 h-4 text-emerald-600" />
                  <span>On Android (Google Chrome):</span>
                </div>
                <ol className="list-decimal list-inside text-xs text-slate-600 space-y-1 pl-1">
                  <li>Open the link in <strong>Google Chrome</strong></li>
                  <li>Tap the <strong>three dots (⋮)</strong> menu in the top right</li>
                  <li>Tap <strong>Install app</strong> or <strong>Add to Home screen</strong></li>
                  <li>Confirm installation to launch standalone from your home screen</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB: SIMULATOR TOGGLE */}
          {activeTab === 'frame' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Mobile Device Shell Preview</h3>
                    <p className="text-xs text-slate-500">
                      Renders the app within an interactive 400x840 mobile frame with status bar, bezel, and mobile viewport constraints.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={onToggleMobileFrame}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isMobileFrameActive
                        ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                        : 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>
                      {isMobileFrameActive
                        ? 'Disable Device Frame (Fill Window)'
                        : 'Enable Mobile Device Frame Simulator'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-500 p-3 bg-amber-50/50 rounded-xl border border-amber-200/50 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Tip: In your browser, you can also press <strong>F12</strong> (or Cmd+Option+I on Mac) and click the <strong>Device Mode (Mobile icon)</strong> in DevTools to test different mobile device screen sizes (iPhone 14, Pixel 7, Galaxy S21, etc.).
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>ADB & USB Debugging Ready</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
