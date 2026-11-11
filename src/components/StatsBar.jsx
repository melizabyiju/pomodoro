import React from 'react';
import { Flame, CheckCircle, Coffee, RotateCcw, Award } from 'lucide-react';

export default function StatsBar({ stats, onClearStats }) {
  const totalMinutes = Math.floor(stats.totalStudySeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const timeFormatted = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  return (
    <div className="w-full max-w-xl mx-auto my-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-300">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Award size={15} className="text-amber-400" />
          Session Statistics
        </span>
        {stats.completedStudySessions > 0 && (
          <button
            onClick={onClearStats}
            title="Clear stats"
            className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw size={12} />
            Reset Stats
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/50">
          <div className="text-xl font-extrabold text-rose-400 font-mono-numbers">
            {stats.completedStudySessions}
          </div>
          <div className="text-[10px] text-slate-400 font-medium uppercase tracking-tight mt-0.5">
            Study Sessions
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/50">
          <div className="text-xl font-extrabold text-amber-400 font-mono-numbers">
            {timeFormatted}
          </div>
          <div className="text-[10px] text-slate-400 font-medium uppercase tracking-tight mt-0.5">
            Focus Time
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/50">
          <div className="text-xl font-extrabold text-emerald-400 font-mono-numbers">
            {stats.completedBreakSessions}
          </div>
          <div className="text-[10px] text-slate-400 font-medium uppercase tracking-tight mt-0.5">
            Breaks Taken
          </div>
        </div>
      </div>
    </div>
  );
}
