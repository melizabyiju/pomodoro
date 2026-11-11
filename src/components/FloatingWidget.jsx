import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Maximize2, MoreHorizontal, X, Coffee, SkipForward, RotateCcw, ExternalLink } from 'lucide-react';
import { SESSION_TYPES, formatTime } from '../hooks/usePomodoroTimer';

export default function FloatingWidget({
  sessionType,
  remainingSeconds,
  totalDuration,
  isRunning,
  hasStarted,
  onTogglePlayPause,
  onSkip,
  onReset,
  onOpenManualBreak,
  onRestore,
  isPiP = false,
  onOpenPiP,
  canPiP = false,
}) {
  const [showMenu, setShowMenu] = useState(false);
  
  // Dragging support for in-page floating widget
  const [position, setPosition] = useState({ x: null, y: null });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, widgetX: 0, widgetY: 0 });
  const widgetRef = useRef(null);

  const isStudy = sessionType === SESSION_TYPES.STUDY;
  const isBreak = sessionType === SESSION_TYPES.BREAK;
  const isManual = sessionType === SESSION_TYPES.MANUAL_BREAK;

  const titleText = isStudy ? 'Focus session' : isBreak ? 'Break session' : 'Manual break';

  // Segmented radial ticks (like Windows 11 Clock app Focus session)
  const totalTicks = 36;
  const elapsed = Math.max(0, totalDuration - remainingSeconds);
  const progressRatio = totalDuration > 0 ? elapsed / totalDuration : 0;
  const activeTicks = Math.round((1 - progressRatio) * totalTicks);

  // Dragging handlers
  const handleMouseDown = (e) => {
    if (isPiP) return;
    // Don't drag if clicking buttons
    if (e.target.closest('button')) return;

    isDraggingRef.current = true;
    const rect = widgetRef.current.getBoundingClientRect();
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      widgetX: rect.left,
      widgetY: rect.top,
    };

    const handleMouseMove = (moveEvent) => {
      if (!isDraggingRef.current) return;
      const dx = moveEvent.clientX - dragStartRef.current.mouseX;
      const dy = moveEvent.clientY - dragStartRef.current.mouseY;
      const newX = Math.max(10, Math.min(window.innerWidth - 270, dragStartRef.current.widgetX + dx));
      const newY = Math.max(10, Math.min(window.innerHeight - 330, dragStartRef.current.widgetY + dy));
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const stylePosition = isPiP
    ? {}
    : position.x !== null
    ? { left: `${position.x}px`, top: `${position.y}px`, right: 'auto', bottom: 'auto' }
    : {};

  // Theme color definitions matching Windows Clock style
  const activeTickColor = isStudy
    ? '#38bdf8' // Windows focus blue
    : isBreak
    ? '#34d399' // Emerald
    : '#f59e0b'; // Amber

  return (
    <div
      ref={widgetRef}
      onMouseDown={handleMouseDown}
      style={stylePosition}
      className={`${
        isPiP
          ? 'w-full h-full p-4 flex flex-col justify-between bg-slate-950 text-slate-100 select-none'
          : 'fixed top-5 right-5 z-50 w-64 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-xl text-slate-100 select-none cursor-grab active:cursor-grabbing animate-in fade-in zoom-in-95'
      }`}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-800/80">
        <button
          onClick={onRestore}
          title="Expand to Full View"
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Maximize2 size={15} />
        </button>

        <span className="text-xs font-semibold text-slate-300 tracking-tight flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              isRunning ? 'bg-sky-400 animate-pulse' : 'bg-slate-500'
            }`}
          />
          {titleText}
        </span>

        <div className="flex items-center gap-1">
          {!isPiP && canPiP && (
            <button
              onClick={onOpenPiP}
              title="Float Always-on-Top over Desktop (Picture-in-Picture)"
              className="p-1 rounded-md text-slate-400 hover:text-sky-300 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ExternalLink size={14} />
            </button>
          )}
          <button
            onClick={onRestore}
            title="Close mini mode"
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Radial Ticks Clock Dial (Windows Focus Session Style) */}
      <div className="relative flex items-center justify-center py-4 px-2">
        <svg className="w-44 h-44 -rotate-90 transform" viewBox="0 0 160 160">
          {Array.from({ length: totalTicks }).map((_, index) => {
            const angle = (index / totalTicks) * 360;
            const rad = (angle * Math.PI) / 180;
            const r1 = 66; // Outer radius
            const r2 = 56; // Inner radius
            const x1 = 80 + r1 * Math.cos(rad);
            const y1 = 80 + r1 * Math.sin(rad);
            const x2 = 80 + r2 * Math.cos(rad);
            const y2 = 80 + r2 * Math.sin(rad);

            const isActive = index < activeTicks;

            return (
              <line
                key={index}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isActive ? activeTickColor : '#334155'}
                strokeWidth="3.2"
                strokeLinecap="round"
                className="transition-colors duration-200"
              />
            );
          })}
        </svg>

        {/* Center Time Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold font-mono tracking-tight text-white drop-shadow">
            {formatTime(remainingSeconds)}
          </span>
          <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider mt-0.5">
            {isRunning ? (isStudy ? 'Focusing' : 'Resting') : hasStarted ? 'Paused' : 'Ready'}
          </span>
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="flex items-center justify-center gap-3 pb-3 px-3 relative">
        <button
          onClick={onTogglePlayPause}
          title={isRunning ? 'Pause' : 'Start / Resume'}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 ${
            isRunning
              ? 'bg-sky-500 hover:bg-sky-400 text-slate-950'
              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
          }`}
        >
          {isRunning ? <Pause size={18} className="fill-current" /> : <Play size={18} className="fill-current ml-0.5" />}
        </button>

        {/* More options menu button */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            title="Options"
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <MoreHorizontal size={16} />
          </button>

          {/* Mini popup dropdown */}
          {showMenu && (
            <div className="absolute bottom-10 right-0 w-36 bg-slate-900 border border-slate-750 rounded-xl shadow-2xl p-1 z-50 text-xs">
              <button
                onClick={() => {
                  setShowMenu(false);
                  onOpenManualBreak();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 cursor-pointer"
              >
                <Coffee size={13} className="text-cyan-400" />
                <span>Manual Break</span>
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  onSkip();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 cursor-pointer"
              >
                <SkipForward size={13} className="text-amber-400" />
                <span>Skip</span>
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  onReset();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 cursor-pointer"
              >
                <RotateCcw size={13} className="text-rose-400" />
                <span>Reset</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
