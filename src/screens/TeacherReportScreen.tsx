import React from 'react';
import {
  ArrowLeft,
  User,
  Search,
  X,
  Plus,
  Minus,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Download
} from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';
import { SlideToConfirmButton } from '../components/SlideToConfirmButton';

export const TeacherReportScreen: React.FC = () => {
  const {
    uiState,
    goBack,
    navigateTo,
    openProfileSheet,
    openExportModal,
    saveAndPublish,
    setPhysicalHeadcount,
    cancelStudentAttendance,
    confirmStudentAttendance,
    setSearchQuery,
    setDeptFilter,
    getFilteredAttendanceRecords,
    prevReportPage,
    nextReportPage
  } = useAttendance();

  const filteredRecords = getFilteredAttendanceRecords();
  const presentCount = filteredRecords.filter((r) => r.isPresent).length;
  const hasDiscrepancy = presentCount > uiState.physicalHeadcount;

  const startIndex = uiState.reportCurrentPage * uiState.reportPageSize;
  const endIndex = Math.min(startIndex + uiState.reportPageSize, filteredRecords.length);
  const pagedRecords = filteredRecords.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredRecords.length / uiState.reportPageSize);

  const deptBadges: Record<string, { bg: string; text: string }> = {
    CSIT: { bg: 'bg-blue-50', text: 'text-blue-700' },
    CSE: { bg: 'bg-indigo-50', text: 'text-indigo-700' },
    ECE: { bg: 'bg-purple-50', text: 'text-purple-700' },
    IT: { bg: 'bg-teal-50', text: 'text-teal-700' }
  };

  return (
    <div
      data-testid="teacher_report_screen"
      className="w-full min-h-screen bg-white flex flex-col justify-between"
    >
      {/* Top Header */}
      <div className="px-5 py-1.5 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <button
            type="button"
            data-testid="report_back_button"
            onClick={goBack}
            className="w-11 h-11 flex items-center justify-center rounded-full text-slate-700 hover:bg-slate-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            data-testid="report_avatar_button"
            onClick={openProfileSheet}
            className="w-[34px] h-[34px] rounded-full bg-[#D97728] border-2 border-orange-200 flex items-center justify-center text-white shadow-xs"
          >
            <User className="w-4 h-4" />
          </button>
        </div>

        <h2 className="text-[17px] font-bold text-slate-900 tracking-tight mt-1">
          CS401: Database Management Systems
        </h2>

        {/* Metadata Row */}
        <div className="flex items-center justify-between text-[11.5px] py-1.5 mt-0.5">
          <div>
            <span className="text-[9.5px] font-semibold text-slate-400 block">INSTRUCTOR</span>
            <span className="font-semibold text-slate-700">Dr. Eleanor Vance</span>
          </div>
          <div>
            <span className="text-[9.5px] font-semibold text-slate-400 block">ROOM</span>
            <span className="font-semibold text-slate-700">Room FB</span>
          </div>
          <div className="text-right">
            <span className="text-[9.5px] font-semibold text-slate-400 block">TIME</span>
            <span className="font-semibold text-slate-700">10:15 AM</span>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 w-full max-w-xl mx-auto px-5 py-2 space-y-2.5 overflow-y-auto">
        {/* Headcount Audit Card */}
        <div
          className={`rounded-xl p-2.5 border transition-colors ${
            hasDiscrepancy ? 'bg-[#FFFBEB] border-amber-200' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-extrabold tracking-wider text-slate-500">
                HEADCOUNT AUDIT
              </span>
              {hasDiscrepancy && (
                <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-600 text-[9.5px] font-bold border border-red-200">
                  +{presentCount - uiState.physicalHeadcount} Discrepancy
                </span>
              )}
            </div>

            {/* Stepper to adjust physical count in room */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-500">Room Count:</span>
              <button
                type="button"
                onClick={() => setPhysicalHeadcount(Math.max(0, uiState.physicalHeadcount - 1))}
                className="w-5.5 h-5.5 rounded bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-700 active:scale-95"
              >
                <Minus className="w-3 h-3" />
              </button>

              <span className="text-[12px] font-bold text-slate-900 px-1 min-w-[18px] text-center">
                {uiState.physicalHeadcount}
              </span>

              <button
                type="button"
                onClick={() => setPhysicalHeadcount(uiState.physicalHeadcount + 1)}
                className="w-5.5 h-5.5 rounded bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-700 active:scale-95"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {hasDiscrepancy && (
            <div className="flex items-start gap-1.5 mt-1.5 pt-1.5 border-t border-amber-200/60">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-900 leading-tight">
                Sir, app has {presentCount} present but physical room count is{' '}
                {uiState.physicalHeadcount}. Call out list below and tap '✕ Cancel' on missing
                students.
              </p>
            </div>
          )}
        </div>

        {/* Section Header & Present Badge */}
        <div className="flex items-center justify-between pt-0.5">
          <h3 className="text-[13.5px] font-bold text-slate-800">
            Verified Attendance List
          </h3>
          <span className="px-2.5 py-0.5 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-800 text-[11px] font-semibold">
            {presentCount} / {filteredRecords.length} Present
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            data-testid="report_search_field"
            value={uiState.searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student name, roll no..."
            className="w-full h-11 pl-9 pr-9 rounded-lg border border-slate-200 bg-white text-[11.5px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D97728]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          {uiState.searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Department Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {['All', 'CSIT', 'CSE', 'ECE', 'IT'].map((dept) => {
            const isSelected = uiState.selectedDeptFilter.toLowerCase() === dept.toLowerCase();
            return (
              <button
                key={dept}
                type="button"
                onClick={() => setDeptFilter(dept)}
                className={`px-3 py-1 rounded-full text-[10.5px] font-semibold whitespace-nowrap transition-colors border ${
                  isSelected
                    ? 'bg-[#D97728] border-[#D97728] text-white'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {dept}
              </button>
            );
          })}
        </div>

        {/* Student Records Table */}
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-xs">
          <div className="bg-[#F8FAFC] px-2.5 py-2 flex items-center text-[9.5px] font-bold text-slate-400 border-b border-slate-200">
            <span className="w-9">S.NO.</span>
            <span className="flex-1">STUDENT NAME</span>
            <span className="w-12">DEPT</span>
            <span className="w-16 text-right">SIR ACTION</span>
          </div>

          {pagedRecords.length === 0 ? (
            <div className="p-5 text-center text-[12px] text-slate-400">
              No students found matching filter
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pagedRecords.map((record) => {
                const deptStyle = deptBadges[record.dept] || {
                  bg: 'bg-slate-100',
                  text: 'text-slate-700'
                };

                return (
                  <div
                    key={record.sNo}
                    className="px-2.5 py-2 flex items-center text-[11.5px] hover:bg-slate-50/50"
                  >
                    <span className="w-9 font-mono text-[11px] text-slate-400">
                      {record.sNo}
                    </span>

                    <div className="flex-1 flex items-center gap-1.5 min-w-0 pr-1">
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          record.isPresent ? 'bg-[#059669]' : 'bg-red-500'
                        }`}
                      />
                      <span
                        className={`truncate font-medium ${
                          record.isPresent ? 'text-slate-800' : 'text-slate-400'
                        }`}
                      >
                        {record.studentName}
                      </span>
                    </div>

                    <div className="w-12">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${deptStyle.bg} ${deptStyle.text}`}
                      >
                        {record.dept}
                      </span>
                    </div>

                    {/* Sir's Action Button */}
                    <div className="w-16 flex justify-end">
                      {record.isPresent ? (
                        <button
                          type="button"
                          data-testid={`cancel_att_${record.sNo}`}
                          onClick={() => cancelStudentAttendance(record.sNo)}
                          className="px-1.5 py-0.5 rounded border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 text-[9.5px] font-bold flex items-center gap-0.5 active:scale-95 transition-all"
                        >
                          <X className="w-2.5 h-2.5" />
                          <span>Cancel</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => confirmStudentAttendance(record.sNo)}
                          className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 hover:bg-slate-200 text-[9.5px] font-medium"
                        >
                          Absent
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination Row */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
          <span>
            Showing {pagedRecords.length} of {filteredRecords.length} verified entries
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={uiState.reportCurrentPage === 0}
              onClick={prevReportPage}
              className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4 text-slate-700" />
            </button>
            <button
              type="button"
              disabled={uiState.reportCurrentPage >= totalPages - 1}
              onClick={nextReportPage}
              className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4 text-slate-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-5 py-4 flex flex-col items-center gap-2 border-t border-slate-100 bg-white">
        {/* Primary Amber Export Button */}
        <button
          type="button"
          data-testid="export_csv_button"
          onClick={openExportModal}
          className="w-full h-12 rounded-xl bg-[#D97728] hover:bg-[#A34B16] text-white text-[13px] font-semibold flex items-center justify-center gap-2 shadow-md transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV / Sheet</span>
        </button>

        {/* Slide to Publish */}
        <SlideToConfirmButton
          title="SLIDE TO SAVE & PUBLISH"
          brandColor="#D97728"
          onConfirmed={saveAndPublish}
          data-testid="save_publish_button"
        />

        {/* Back to Dashboard */}
        <button
          type="button"
          data-testid="back_to_dashboard_link"
          onClick={() => navigateTo('TEACHER_BROADCAST_SETUP')}
          className="text-[11px] font-medium text-slate-400 hover:text-slate-600 py-1"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Toast Notification */}
      {uiState.userNotification && (
        <div className="fixed bottom-16 inset-x-4 max-w-sm mx-auto z-50 p-3 rounded-lg bg-slate-900 text-white text-[12px] shadow-xl text-center animate-in fade-in slide-in-from-bottom duration-200">
          {uiState.userNotification}
        </div>
      )}
    </div>
  );
};
