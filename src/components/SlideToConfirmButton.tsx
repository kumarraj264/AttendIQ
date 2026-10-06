import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowRight, Check, ChevronsRight } from 'lucide-react';
import { triggerHaptic } from '../utils/haptic';

interface SlideToConfirmButtonProps {
  title: string;
  brandColor?: string; // e.g. '#0F87AC' or '#D97728'
  isConfirmed?: boolean;
  onConfirmed: () => void;
  enabled?: boolean;
  className?: string;
  'data-testid'?: string;
}

export const SlideToConfirmButton: React.FC<SlideToConfirmButtonProps> = ({
  title,
  brandColor = '#0F87AC',
  isConfirmed = false,
  onConfirmed,
  enabled = true,
  className = '',
  'data-testid': testId = 'slide_to_confirm_container'
}) => {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [localConfirmed, setLocalConfirmed] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const lastTickRatioRef = useRef(0);
  const thumbSize = 46;

  const confirmed = isConfirmed || localConfirmed;

  const getMaxDrag = useCallback(() => {
    if (!containerRef.current) return 0;
    return Math.max(0, containerRef.current.clientWidth - thumbSize - 6);
  }, [thumbSize]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!enabled || confirmed) return;
    setIsDragging(true);
    triggerHaptic('light');
    lastTickRatioRef.current = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || confirmed || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const maxDrag = getMaxDrag();
    const newX = Math.max(0, Math.min(e.clientX - rect.left - thumbSize / 2, maxDrag));
    setDragX(newX);

    // Tactile ticks on sliding steps (every 12.5% of progress)
    const ratio = maxDrag > 0 ? newX / maxDrag : 0;
    const currentTickStep = Math.floor(ratio * 8);
    if (currentTickStep !== lastTickRatioRef.current) {
      triggerHaptic('light');
      lastTickRatioRef.current = currentTickStep;
    }
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const maxDrag = getMaxDrag();
    if (dragX >= maxDrag * 0.72) {
      setDragX(maxDrag);
      setLocalConfirmed(true);
      triggerHaptic('success');
      onConfirmed();
    } else {
      setDragX(0);
      triggerHaptic('medium'); // subtle feedback for spring-back reset
    }
  };

  useEffect(() => {
    if (!isConfirmed && localConfirmed) {
      setLocalConfirmed(false);
      setDragX(0);
    }
  }, [isConfirmed, localConfirmed]);

  const maxDrag = getMaxDrag();
  const currentOffset = confirmed && maxDrag > 0 ? maxDrag : dragX;
  const progressRatio = maxDrag > 0 ? Math.min(currentOffset / maxDrag, 1) : 0;

  return (
    <div
      ref={containerRef}
      data-testid={testId}
      className={`relative w-full h-[52px] rounded-[26px] bg-slate-100 border-[1.5px] border-slate-200 overflow-hidden select-none touch-none shadow-xs ${className}`}
    >
      {/* Dynamic gradient track behind slider */}
      <div
        className={`absolute top-0 left-0 bottom-0 ${
          isDragging ? 'transition-none' : 'transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]'
        }`}
        style={{
          width: `${currentOffset + thumbSize}px`,
          background: `linear-gradient(to right, ${brandColor}35, ${brandColor}85)`
        }}
      />

      {/* Center Text with directional guiding chevrons */}
      <div className="absolute inset-0 flex items-center justify-center pl-12 pr-4 pointer-events-none">
        <div
          className="flex items-center gap-1.5 transition-opacity duration-200"
          style={{ opacity: 1 - progressRatio * 0.75 }}
        >
          <span
            className="text-[12px] font-bold tracking-wider"
            style={{ color: confirmed ? '#059669' : '#475569' }}
          >
            {confirmed ? 'CONFIRMED ✓' : title}
          </span>
          {!confirmed && (
            <ChevronsRight className="w-4 h-4 text-slate-400 animate-pulse" />
          )}
        </div>
      </div>

      {/* Draggable Circle Thumb */}
      <div
        data-testid="slide_thumb"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`absolute top-[3px] left-[3px] w-[46px] h-[46px] rounded-full shadow-md flex items-center justify-center cursor-grab active:cursor-grabbing text-white z-10 ${
          isDragging
            ? 'scale-105 shadow-lg transition-none'
            : 'transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]'
        }`}
        style={{
          transform: `translateX(${currentOffset}px)`,
          backgroundColor: confirmed ? '#059669' : brandColor
        }}
      >
        {confirmed ? (
          <Check className="w-5 h-5 text-white animate-scale-up" />
        ) : (
          <ArrowRight className="w-5 h-5 text-white" />
        )}
      </div>
    </div>
  );
};
