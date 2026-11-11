import React, { useState } from 'react';
import { X, Coffee, Clock, Sparkles } from 'lucide-react';
import { formatTime } from '../hooks/usePomodoroTimer';

const PRESET_OPTIONS = [
  { label: '5 Minutes', seconds: 5 * 60, desc: 'Quick stretch & water' },
  { label: '10 Minutes', seconds: 10 * 60, desc: 'Standard refresh' },
  { label: '15 Minutes', seconds: 15 * 60, desc: 'Tea or coffee break' },
  { label: '20 Minutes', seconds: 20 * 60, desc: 'Walk or meditation' },
  { label: '30 Minutes', seconds: 30 * 60, desc: 'Meal or longer rest' },
];

export default function ManualBreakModal({
  isOpen,
  onClose,
  onSelectBreak,
  currentRemaining,
  currentSessionType,
}) {
  const [customMinutes, setCustomMinutes] = useState(8);
  const [customSeconds, setCustomSeconds] = useState(0);

  if (!isOpen) return null;

  const handleStartCustom = (e) => {
    e.preventDefault();
    const totalSecs = (parseInt(customMinutes, 10) || 0) * 60 + (parseInt(customSeconds, 10) || 0);
    if (totalSecs > 0) {
      onSelectBreak(totalSecs);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400">
            <Coffee size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Manual Break</h2>
            <p className="text-xs text-slate-400">Interrupt cycle without losing progress</p>
          </div>
        </div>

        {/* Informative Banner */}
        <div className="my-4 p-3.5 bg-slate-850/60 border border-slate-800 rounded-2xl flex items-center gap-3">
          <Clock className="w-5 h-5 text-cyan-400 shrink-0" />
          <p className="text-xs text-slate-300 leading-relaxed">
            Your current <span className="font-semibold text-rose-300">{currentSessionType}</span> countdown (
            <span className="font-mono-numbers text-cyan-300 font-semibold">{formatTime(currentRemaining)}</span>
            ) will be safely frozen. You can resume it anytime!
          </p>
        </div>

        {/* Presets Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-5">
          {PRESET_OPTIONS.map((opt) => (
            <button
              key={opt.seconds}
              onClick={() => {
                onSelectBreak(opt.seconds);
                onClose();
              }}
              className="p-3 rounded-2xl bg-slate-850 hover:bg-cyan-950/40 border border-slate-750 hover:border-cyan-500/50 text-left transition-all duration-150 group cursor-pointer"
            >
              <div className="text-sm font-bold text-slate-100 group-hover:text-cyan-300">
                {opt.label}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {opt.desc}
              </div>
            </button>
          ))}
        </div>

        {/* Custom Duration Form */}
        <form onSubmit={handleStartCustom} className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Sparkles size={14} className="text-cyan-400" />
              Custom Duration
            </span>
            <span className="text-[11px] text-slate-500">MM : SS</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-[10px] text-slate-400 block mb-1">Minutes</label>
              <input
                type="number"
                min="0"
                max="180"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-900 border border-slate-750 rounded-xl px-3 py-2 text-white font-mono font-semibold text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="text-xl font-bold text-slate-600 pt-4">:</div>
            <div className="flex-1">
              <label className="text-[10px] text-slate-400 block mb-1">Seconds</label>
              <input
                type="number"
                min="0"
                max="59"
                value={customSeconds}
                onChange={(e) => setCustomSeconds(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                className="w-full bg-slate-900 border border-slate-750 rounded-xl px-3 py-2 text-white font-mono font-semibold text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="pt-4">
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm transition-all shadow-md cursor-pointer"
              >
                Start
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
