import React from 'react';
import { ArrowRight, Repeat, CheckCircle2 } from 'lucide-react';
import { SESSION_TYPES } from '../hooks/usePomodoroTimer';

export default function CycleTimeline({ sessionType, stats }) {
  const isStudy = sessionType === SESSION_TYPES.STUDY;
  const isBreak = sessionType === SESSION_TYPES.BREAK;
  const isManual = sessionType === SESSION_TYPES.MANUAL_BREAK;

  return (
    <div className="w-full max-w-xl mx-auto my-5 p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Repeat className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Infinite Auto Cycle
          </span>
        </div>
        <div className="text-xs text-slate-400 font-medium">
          Cycle Completed: <span className="font-bold text-white">{stats.cycleCount}</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        {/* Step 1: Study 30:00 */}
        <div
          className={`flex-1 flex flex-col p-3 rounded-xl border transition-all duration-200 ${
            isStudy
              ? 'bg-rose-500/10 border-rose-500/50 text-white shadow-lg shadow-rose-500/10 ring-1 ring-rose-500/40'
              : 'bg-slate-950/40 border-slate-800/80 text-slate-400 opacity-70'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
              Session 1
            </span>
            {isStudy && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            )}
          </div>
          <span className="text-sm font-extrabold text-slate-100 mt-0.5">30:00 STUDY</span>
          <span className="text-[10px] text-slate-400">Full Focus</span>
        </div>

        {/* Transition Arrow */}
        <div className="flex flex-col items-center px-1 text-slate-600">
          <ArrowRight className="w-4 h-4 text-slate-500 animate-pulse" />
          <span className="text-[9px] uppercase font-mono tracking-tighter text-slate-500">Auto</span>
        </div>

        {/* Step 2: Break 10:00 */}
        <div
          className={`flex-1 flex flex-col p-3 rounded-xl border transition-all duration-200 ${
            isBreak
              ? 'bg-emerald-500/10 border-emerald-500/50 text-white shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/40'
              : 'bg-slate-950/40 border-slate-800/80 text-slate-400 opacity-70'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Session 2
            </span>
            {isBreak && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            )}
          </div>
          <span className="text-sm font-extrabold text-slate-100 mt-0.5">10:00 BREAK</span>
          <span className="text-[10px] text-slate-400">Rest & Recharge</span>
        </div>

        {/* Transition Loop Arrow */}
        <div className="flex flex-col items-center px-1 text-slate-600">
          <ArrowRight className="w-4 h-4 text-slate-500 animate-pulse" />
          <span className="text-[9px] uppercase font-mono tracking-tighter text-slate-500">Loop</span>
        </div>

        {/* Step 3: Next Study 30:00 */}
        <div className="flex-1 flex flex-col p-3 rounded-xl border bg-slate-950/40 border-slate-800/60 text-slate-500 opacity-60">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Session 3
          </span>
          <span className="text-sm font-bold text-slate-400 mt-0.5">30:00 STUDY</span>
          <span className="text-[10px] text-slate-500">Continuous</span>
        </div>
      </div>
    </div>
  );
}
