import React from 'react';
import { X, FileText, CheckCircle2, Upload } from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';

export const DocPreviewDialog: React.FC = () => {
  const { uiState, closeDocPreview, exportCsv } = useAttendance();

  if (!uiState.isDocPreviewOpen) return null;

  const handleReplaceAction = () => {
    closeDocPreview();
    exportCsv();
  };

  return (
    <div
      data-testid="doc_preview_dialog"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={closeDocPreview}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl p-5 shadow-2xl flex flex-col gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="text-[15px] font-bold text-slate-900">{uiState.docPreviewTitle}</h3>
          </div>
          <button
            onClick={closeDocPreview}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-slate-100">
          <span className="text-[11px] text-slate-500">OCR Extraction Status</span>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>100% Verified Match</span>
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="text-[9px] font-bold text-slate-400 tracking-wider mb-1">
            METADATA & DOCUMENT INTEGRITY
          </div>
          <pre className="text-[11.5px] font-mono text-slate-700 whitespace-pre-wrap leading-relaxed">
            {uiState.docPreviewContent}
          </pre>
        </div>

        <p className="text-[10.5px] text-slate-500">
          You can re-upload or scan a new document at any time. Changes sync across enrolled semesters automatically.
        </p>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={closeDocPreview}
            className="px-3.5 py-2 rounded-lg border border-slate-200 text-slate-700 text-[12px] font-medium hover:bg-slate-50"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handleReplaceAction}
            className="px-4 py-2 rounded-lg bg-[#0F87AC] hover:bg-[#0C7394] text-white text-[12px] font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Upload New File</span>
          </button>
        </div>
      </div>
    </div>
  );
};
