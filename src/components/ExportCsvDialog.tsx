import React, { useState } from 'react';
import { X, Table, Copy, Download, Check } from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';

export const ExportCsvDialog: React.FC = () => {
  const { uiState, closeExportModal, getFilteredAttendanceRecords, exportCsv } = useAttendance();
  const [copied, setCopied] = useState(false);

  if (!uiState.isExportModalOpen) return null;

  const records = getFilteredAttendanceRecords();
  const csvHeader = 'S.No,Student Name,Department,Attendance Status,Verification Mode,Timestamp';
  const csvBody = records
    .map(
      (it) =>
        `${it.sNo},${it.studentName},${it.dept},${it.isPresent ? 'PRESENT' : 'ABSENT'},Ultrasonic+BLE,10:18 AM`
    )
    .join('\n');
  const fullCsvText = `${csvHeader}\n${csvBody}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullCsvText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([fullCsvText], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'GGU_CS401_Attendance.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    exportCsv();
  };

  return (
    <div
      data-testid="export_csv_dialog"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={closeExportModal}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl p-5 shadow-2xl flex flex-col gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-[#D97728] flex items-center justify-center">
              <Table className="w-4 h-4" />
            </div>
            <h3 className="text-[15px] font-bold text-slate-900">Export Attendance Sheet</h3>
          </div>
          <button
            onClick={closeExportModal}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-slate-100">
          <span className="text-[11px] font-bold text-slate-800">
            CS401: Database Management Systems
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">
            {records.filter((r) => r.isPresent).length} / {records.length} Verified
          </span>
        </div>

        <div className="h-32 bg-slate-900 rounded-lg p-2.5 overflow-y-auto">
          <pre className="text-[10px] font-mono text-blue-300 leading-relaxed whitespace-pre-wrap">
            {fullCsvText}
          </pre>
        </div>

        <div className="flex items-center justify-between text-[10.5px] text-slate-500">
          <span>Filename: CS401_Attendance.csv</span>
          <button
            type="button"
            onClick={handleCopy}
            className="h-7 px-2.5 rounded border border-slate-200 text-slate-700 font-medium flex items-center gap-1 hover:bg-slate-50"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy CSV'}</span>
          </button>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={closeExportModal}
            className="px-3.5 py-2 rounded-lg border border-slate-200 text-slate-700 text-[12px] font-medium hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="px-4 py-2 rounded-lg bg-[#D97728] hover:bg-[#A34B16] text-white text-[12px] font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download .CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
};
