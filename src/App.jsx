import React, { useState } from 'react';
import Header from './components/Header';
import TimerDisplay from './components/TimerDisplay';
import Controls from './components/Controls';
import CycleTimeline from './components/CycleTimeline';
import StatsBar from './components/StatsBar';
import ManualBreakModal from './components/ManualBreakModal';
import SettingsModal from './components/SettingsModal';
import { usePomodoroTimer, SESSION_TYPES } from './hooks/usePomodoroTimer';

export default function App() {
  const {
    sessionType,
    studyDuration,
    breakDuration,
    totalDuration,
    remainingSeconds,
    isRunning,
    interruptedSession,
    soundEnabled,
    setSoundEnabled,
    notificationsEnabled,
    setNotificationsEnabled,
    stats,
    togglePlayPause,
    resetSession,
    skipSession,
    startManualBreak,
    resumeInterruptedSession,
    updateDurations,
    clearStats,
  } = usePomodoroTimer();

  const [isManualBreakModalOpen, setIsManualBreakModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Background glow effect based on session type
  const bgGlow =
    sessionType === SESSION_TYPES.STUDY
      ? 'from-rose-950/20 via-slate-950 to-slate-950'
      : sessionType === SESSION_TYPES.BREAK
      ? 'from-emerald-950/20 via-slate-950 to-slate-950'
      : 'from-cyan-950/20 via-slate-950 to-slate-950';

  return (
    <div className={`min-h-screen bg-gradient-to-b ${bgGlow} text-slate-100 flex flex-col justify-between py-6 px-4 selection:bg-rose-500/30 selection:text-rose-200 transition-colors duration-700`}>
      {/* Top Header */}
      <Header
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        notificationsEnabled={notificationsEnabled}
        setNotificationsEnabled={setNotificationsEnabled}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center flex-1 my-2">
        {/* Timer Display with circular gauge */}
        <TimerDisplay
          sessionType={sessionType}
          remainingSeconds={remainingSeconds}
          totalDuration={totalDuration}
          isRunning={isRunning}
          interruptedSession={interruptedSession}
          onResumeInterrupted={resumeInterruptedSession}
        />

        {/* Action Controls */}
        <Controls
          isRunning={isRunning}
          onTogglePlayPause={togglePlayPause}
          onReset={resetSession}
          onSkip={skipSession}
          onOpenManualBreak={() => setIsManualBreakModalOpen(true)}
        />

        {/* Infinite Cycle Timeline */}
        <CycleTimeline sessionType={sessionType} stats={stats} />

        {/* Session Stats */}
        <StatsBar stats={stats} onClearStats={clearStats} />
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-4 text-xs text-slate-500">
        <p>
          Continuous repeating countdown engine &bull; Timestamp-synchronized &bull; Precision timer
        </p>
      </footer>

      {/* Manual Break Modal */}
      <ManualBreakModal
        isOpen={isManualBreakModalOpen}
        onClose={() => setIsManualBreakModalOpen(false)}
        onSelectBreak={startManualBreak}
        currentRemaining={remainingSeconds}
        currentSessionType={sessionType}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        studyDuration={studyDuration}
        breakDuration={breakDuration}
        onSaveDurations={updateDurations}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        notificationsEnabled={notificationsEnabled}
        setNotificationsEnabled={setNotificationsEnabled}
      />
    </div>
  );
}
