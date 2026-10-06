import React, { useState, useRef } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown, GraduationCap, School } from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';
import { Role } from '../types';

export const RoleSelectionScreen: React.FC = () => {
  const { selectRole } = useAttendance();
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const startYRef = useRef<number | null>(null);

  const handleSelect = (role: Role) => {
    if (selectedRole) return;
    setSelectedRole(role);
    // Smooth transition feedback before switching screen
    setTimeout(() => {
      selectRole(role);
    }, 220);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (selectedRole) return;
    setIsDragging(true);
    startYRef.current = e.clientY;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || startYRef.current === null || selectedRole) return;
    const diff = e.clientY - startYRef.current;
    // Smooth logarithmic rubber-band dampening
    const dampened = Math.sign(diff) * Math.pow(Math.abs(diff), 0.85) * 0.7;
    setDragOffset(dampened);
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const threshold = 55;
    if (dragOffset > threshold) {
      // Swiped DOWN -> TEACHER
      handleSelect('TEACHER');
    } else if (dragOffset < -threshold) {
      // Swiped UP -> STUDENT
      handleSelect('STUDENT');
    } else {
      setDragOffset(0);
    }
    startYRef.current = null;
  };

  return (
    <div
      data-testid="role_selection_screen"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="relative w-full h-full min-h-screen flex flex-col select-none touch-none overflow-hidden bg-slate-900"
    >
      {/* Sliding Content Container */}
      <div
        className={`w-full h-full flex-1 flex flex-col ${
          isDragging ? 'transition-none' : 'transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]'
        }`}
        style={{ transform: `translateY(${dragOffset}px)` }}
      >
        {/* Top Half: Teacher */}
        <div
          data-testid="select_teacher_card"
          onClick={() => handleSelect('TEACHER')}
          className={`flex-1 w-full bg-gradient-to-b from-[#E07A2E] to-[#C9611B] flex flex-col items-center justify-center cursor-pointer p-6 relative overflow-hidden transition-all duration-200 group ${
            selectedRole === 'TEACHER' ? 'brightness-110 scale-[1.02]' : 'hover:brightness-105 active:brightness-95'
          }`}
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-1/4 -right-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />

          <div className="flex flex-col items-center text-center z-10">
            {/* Teacher Icon Badge */}
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-white mb-3 shadow-lg group-hover:scale-105 transition-transform duration-200">
              <GraduationCap className="w-8 h-8" />
            </div>

            <h1 className="text-white text-3xl sm:text-4xl font-black tracking-[3px] drop-shadow-sm">
              TEACHER
            </h1>
            <p className="text-white/80 text-xs font-medium mt-1">
              Broadcast attendance & track attendance
            </p>

            <div className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 backdrop-blur-xs text-white/95 text-[11px] font-bold tracking-[1.5px]">
              <span>SWIPE DOWN OR TAP</span>
              <ChevronDown className="w-4 h-4 animate-bounce" />
            </div>
          </div>
        </div>

        {/* Bottom Half: Student */}
        <div
          data-testid="select_student_card"
          onClick={() => handleSelect('STUDENT')}
          className={`flex-1 w-full bg-gradient-to-t from-[#0A7394] to-[#0F87AC] flex flex-col items-center justify-center cursor-pointer p-6 relative overflow-hidden transition-all duration-200 group ${
            selectedRole === 'STUDENT' ? 'brightness-110 scale-[1.02]' : 'hover:brightness-105 active:brightness-95'
          }`}
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute bottom-1/4 -left-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />

          <div className="flex flex-col items-center text-center z-10">
            <div className="mb-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 backdrop-blur-xs text-white/95 text-[11px] font-bold tracking-[1.5px]">
              <ChevronUp className="w-4 h-4 animate-bounce" />
              <span>SWIPE UP OR TAP</span>
            </div>

            <h1 className="text-white text-3xl sm:text-4xl font-black tracking-[3px] drop-shadow-sm">
              STUDENT
            </h1>
            <p className="text-white/80 text-xs font-medium mt-1">
              Verify campus location & enter session PIN
            </p>

            {/* Student Icon Badge */}
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-white mt-3 shadow-lg group-hover:scale-105 transition-transform duration-200">
              <School className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Static Center Badge with Gentle Pulse */}
      <div
        data-testid="role_indicator_badge"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
      >
        <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0B1528]/95 backdrop-blur-md border-[1.5px] border-white/30 shadow-2xl animate-pulse-subtle">
          <ChevronsUpDown className="w-4 h-4 text-amber-400" />
          <span className="text-white text-[11px] font-extrabold tracking-[2px]">
            SELECT ROLE
          </span>
        </div>
      </div>
    </div>
  );
};
