import React from 'react';
import { SESSION_TYPES, formatTime } from '../hooks/usePomodoroTimer';
import { BookOpen, Coffee, PauseCircle, PlayCircle, Clock, Undo2, PictureInPicture2 } from 'lucide-react';

export default function TimerDisplay({
  sessionType,
  remainingSeconds,
  totalDuration,
  isRunning,
  hasStarted,
  interruptedSession,
  onResumeInterrupted,
  onToggleFloating,
}) {
  const radius = 150;
  const stroke = 10;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate progress percent (0% at start, 100% when time runs out)
  const elapsed = Math.max(0, totalDuration - remainingSeconds);
  const progressPercent = totalDuration > 0 ? (elapsed / totalDuration) : 0;
  const strokeDashoffset = circumference - (progressPercent * circumference);

  const isStudy = sessionType === SESSION_TYPES.STUDY;
  const isBreak = sessionType === SESSION_TYPES.BREAK;
  const isManualBreak = sessionType === SESSION_TYPES.MANUAL_BREAK;

  // Visual theming
  let theme = {
    ringColor: 'stroke-rose-500',
    ringGradientId: 'studyGradient',
    gradientStops: (
      <>
        <stop offset="0%" stopColor="#f43f5e" />
        <stop offset="100%" stopColor="#fb923c" />
      </>
    ),
    glowClass: 'shadow-rose-500/20 shadow-2xl',
    badgeBg: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
    badgeText: 'STUDY SESSION',
    icon: <BookOpen className="w-5 h-5 text-rose-400 animate-pulse" />,
    subtext: 'Auto-transitions to 10:00 Break at 00:00',
    cycleLabel: 'Focus Period',
  };

  if (isBreak) {
    theme = {
      ringColor: 'stroke-emerald-500',
      ringGradientId: 'breakGradient',
      gradientStops: (
        <>
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#14b8a6" />
        </>
      ),
      glowClass: 'shadow-emerald-500/20 shadow-2xl',
      badgeBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
      badgeText: 'BREAK SESSION',
      icon: <Coffee className="w-5 h-5 text-emerald-400 animate-pulse" />,
      subtext: 'Auto-transitions to 30:00 Study at 00:00',
      cycleLabel: 'Recharge & Rest',
    };
  } else if (isManualBreak) {
    theme = {
      ringColor: 'stroke-cyan-500',
      ringGradientId: 'manualGradient',
      gradientStops: (
        <>
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#3b82f6" />
        </>
      ),
      glowClass: 'shadow-cyan-500/20 shadow-2xl',
      badgeBg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300',
      badgeText: 'MANUAL BREAK (CYCLE PAUSED)',
      icon: <PauseCircle className="w-5 h-5 text-cyan-400" />,
      subtext: 'Interrupted session preserved — resume anytime',
      cycleLabel: 'Temporary Break',
    };
  }

  const formattedTime = formatTime(remainingSeconds);

  return (
    <div className="flex flex-col items-center justify-center my-6 relative select-none">
      {/* Interrupted Session Banner when in Manual Break */}
      {isManualBreak && interruptedSession && (
        <div className="mb-6 w-full max-w-md bg-gradient-to-r from-cyan-950/80 via-slate-900 to-cyan-950/80 border border-cyan-800/60 rounded-2xl p-4 shadow-xl backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs text-cyan-400/80 uppercase font-semibold tracking-wider">
                Preserved Session
              </p>
              <p className="text-sm font-bold text-slate-100">
                {interruptedSession.sessionType}:{' '}
                <span className="font-mono-numbers text-cyan-300">
                  {formatTime(interruptedSession.remainingSeconds)}
                </span>{' '}
                remaining
              </p>
            </div>
          </div>
          <button
            onClick={onResumeInterrupted}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-all shadow-md cursor-pointer"
          >
            <Undo2 size={14} />
            Resume
          </button>
        </div>
      )}

      {/* Circular Progress & Display Container */}
      <div className={`relative w-80 h-80 sm:w-96 sm:h-96 rounded-full flex items-center justify-center bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl ${theme.glowClass}`}>
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 340 340">
          <defs>
            <linearGradient id={theme.ringGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              {theme.gradientStops}
            </linearGradient>
          </defs>

          {/* Background Track Ring */}
          <circle
            cx="170"
            cy="170"
            r={radius}
            stroke="currentColor"
            strokeWidth={stroke}
            fill="transparent"
            className="text-slate-800/50"
          />

          {/* Animated Countdown Progress Ring */}
          <circle
            cx="170"
            cy="170"
            r={radius}
            stroke={`url(#${theme.ringGradientId})`}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-300 ease-linear"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
          {/* Status Badge */}
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold tracking-wider uppercase mb-3 ${theme.badgeBg}`}>
            {theme.icon}
            <span>{theme.badgeText}</span>
          </div>

          {/* Digital Time Display (MM:SS) */}
          <div className="text-6xl sm:text-7xl font-extrabold tracking-tight font-mono-numbers text-white drop-shadow-md">
            {formattedTime}
          </div>

          {/* Running / Paused / Ready State Tag */}
          <div className="mt-3 flex items-center gap-1.5 text-xs font-medium">
            {isRunning ? (
              <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-0.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                LIVE COUNTDOWN
              </span>
            ) : hasStarted ? (
              <span className="flex items-center gap-1.5 text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2.5 py-0.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                PAUSED
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-sky-400 bg-sky-950/40 border border-sky-800/40 px-2.5 py-0.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                READY &bull; CLICK START
              </span>
            )}
          </div>

          {/* Subtext explaining auto transition */}
          <p className="mt-4 text-[11px] text-slate-400 max-w-[210px] leading-tight">
            {theme.subtext}
          </p>

          {/* Quick Float Button (matching Windows 11 Focus session icon) */}
          {onToggleFloating && (
            <button
              onClick={onToggleFloating}
              title="Float mini timer (F)"
              className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-sky-300 hover:bg-slate-800/60 px-2 py-1 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-700"
            >
              <PictureInPicture2 size={13} />
              <span>Float Mini Window</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
