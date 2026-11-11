import React, { useEffect } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Coffee } from 'lucide-react';

export default function Controls({
  isRunning,
  onTogglePlayPause,
  onReset,
  onSkip,
  onOpenManualBreak,
}) {
  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        onTogglePlayPause();
      } else if (e.key === 'r' || e.key === 'R') {
        onReset();
      } else if (e.key === 's' || e.key === 'S') {
        onSkip();
      } else if (e.key === 'm' || e.key === 'M') {
        onOpenManualBreak();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onTogglePlayPause, onReset, onSkip, onOpenManualBreak]);

  return (
    <div className="flex flex-col items-center gap-4 mt-2">
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Reset Session */}
        <button
          onClick={onReset}
          title="Reset current session (R)"
          className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 hover:bg-slate-850 active:scale-95 transition-all duration-150 cursor-pointer shadow-lg group"
        >
          <RotateCcw className="w-5 h-5 group-hover:-rotate-45 transition-transform duration-200" />
        </button>

        {/* Primary Play / Pause Button */}
        <button
          onClick={onTogglePlayPause}
          title={isRunning ? 'Pause timer (Space)' : 'Start / Resume timer (Space)'}
          className={`px-8 sm:px-10 py-4 sm:py-4.5 rounded-2xl font-bold flex items-center gap-3 text-base sm:text-lg transition-all duration-200 active:scale-95 cursor-pointer shadow-2xl ${
            isRunning
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25'
              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-6 h-6 fill-current" />
              <span>PAUSE</span>
            </>
          ) : (
            <>
              <Play className="w-6 h-6 fill-current" />
              <span>RESUME</span>
            </>
          )}
        </button>

        {/* Skip to Next Session */}
        <button
          onClick={onSkip}
          title="Skip to next session (S)"
          className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 hover:bg-slate-850 active:scale-95 transition-all duration-150 cursor-pointer shadow-lg group"
        >
          <SkipForward className="w-5 h-5 group-hover:translate-x-0.5 transition-transform duration-200" />
        </button>
      </div>

      {/* Manual Break Button */}
      <button
        onClick={onOpenManualBreak}
        className="mt-1 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-cyan-800/40 hover:border-cyan-500/50 text-cyan-300 text-xs sm:text-sm font-semibold transition-all duration-200 shadow-md group cursor-pointer"
      >
        <Coffee className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform duration-200" />
        <span>Take a Manual Break</span>
        <span className="text-[10px] text-cyan-400/60 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
          M
        </span>
      </button>

      {/* Keyboard Shortcuts Hint */}
      <div className="flex items-center gap-4 text-[11px] text-slate-400 mt-2">
        <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300 font-mono">Space</kbd> Pause/Play</span>
        <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300 font-mono">R</kbd> Reset</span>
        <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300 font-mono">S</kbd> Skip</span>
      </div>
    </div>
  );
}
