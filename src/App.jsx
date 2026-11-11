import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Header from './components/Header';
import TimerDisplay from './components/TimerDisplay';
import Controls from './components/Controls';
import CycleTimeline from './components/CycleTimeline';
import StatsBar from './components/StatsBar';
import ManualBreakModal from './components/ManualBreakModal';
import SettingsModal from './components/SettingsModal';
import FloatingWidget from './components/FloatingWidget';
import { usePomodoroTimer, SESSION_TYPES } from './hooks/usePomodoroTimer';

export default function App() {
  const {
    sessionType,
    studyDuration,
    breakDuration,
    totalDuration,
    remainingSeconds,
    isRunning,
    hasStarted,
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
  const [isFloating, setIsFloating] = useState(false);
  const [pipWindow, setPipWindow] = useState(null);

  const canPiP = typeof window !== 'undefined' && 'documentPictureInPicture' in window;

  // Open native Desktop Always-On-Top Window (Document Picture-in-Picture)
  const openDesktopPiP = async () => {
    if (!canPiP) {
      // Fallback to in-page floating widget
      setIsFloating(true);
      return;
    }

    try {
      if (pipWindow) {
        pipWindow.close();
        setPipWindow(null);
        return;
      }

      const pip = await window.documentPictureInPicture.requestWindow({
        width: 280,
        height: 350,
      });

      // Copy all existing stylesheets to the PiP window so styling looks identical
      [...document.styleSheets].forEach((styleSheet) => {
        try {
          const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
          const style = document.createElement('style');
          style.textContent = cssRules;
          pip.document.head.appendChild(style);
        } catch (e) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.type = styleSheet.type;
          link.media = styleSheet.media;
          link.href = styleSheet.href;
          pip.document.head.appendChild(link);
        }
      });

      // Match body styling
      pip.document.body.className = 'bg-slate-950 text-slate-100 m-0 p-0 overflow-hidden flex items-center justify-center h-full select-none';
      pip.document.title = 'Focus Session';

      pip.addEventListener('pagehide', () => {
        setPipWindow(null);
      });

      setPipWindow(pip);
    } catch (err) {
      console.warn('PiP window open failed, fallback to in-page float:', err);
      setIsFloating(true);
    }
  };

  const toggleFloatingMode = () => {
    setIsFloating((prev) => !prev);
  };

  // Background glow effect based on session type
  const bgGlow =
    sessionType === SESSION_TYPES.STUDY
      ? 'from-rose-950/20 via-slate-950 to-slate-950'
      : sessionType === SESSION_TYPES.BREAK
      ? 'from-emerald-950/20 via-slate-950 to-slate-950'
      : 'from-cyan-950/20 via-slate-950 to-slate-950';

  return (
    <div className={`min-h-screen bg-gradient-to-b ${bgGlow} text-slate-100 flex flex-col justify-between py-6 px-4 selection:bg-rose-500/30 selection:text-rose-200 transition-colors duration-700 relative`}>
      {/* Top Header */}
      <Header
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        notificationsEnabled={notificationsEnabled}
        setNotificationsEnabled={setNotificationsEnabled}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onToggleFloating={toggleFloatingMode}
      />

      {/* Main Content Area */}
      <main className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center flex-1 my-2">
        {/* Timer Display with circular gauge */}
        <TimerDisplay
          sessionType={sessionType}
          remainingSeconds={remainingSeconds}
          totalDuration={totalDuration}
          isRunning={isRunning}
          hasStarted={hasStarted}
          interruptedSession={interruptedSession}
          onResumeInterrupted={resumeInterruptedSession}
          onToggleFloating={toggleFloatingMode}
        />

        {/* Action Controls */}
        <Controls
          isRunning={isRunning}
          hasStarted={hasStarted}
          onTogglePlayPause={togglePlayPause}
          onReset={resetSession}
          onSkip={skipSession}
          onOpenManualBreak={() => setIsManualBreakModalOpen(true)}
          onToggleFloating={toggleFloatingMode}
        />

        {/* Infinite Cycle Timeline */}
        <CycleTimeline sessionType={sessionType} stats={stats} />

        {/* Session Stats */}
        <StatsBar stats={stats} onClearStats={clearStats} />
      </main>

      {/* In-Page Floating Mini-Player Widget */}
      {isFloating && (
        <FloatingWidget
          sessionType={sessionType}
          remainingSeconds={remainingSeconds}
          totalDuration={totalDuration}
          isRunning={isRunning}
          hasStarted={hasStarted}
          onTogglePlayPause={togglePlayPause}
          onSkip={skipSession}
          onReset={resetSession}
          onOpenManualBreak={() => setIsManualBreakModalOpen(true)}
          onRestore={() => setIsFloating(false)}
          canPiP={canPiP}
          onOpenPiP={openDesktopPiP}
        />
      )}

      {/* OS Desktop Always-on-top Picture-in-Picture Portal */}
      {pipWindow &&
        createPortal(
          <FloatingWidget
            sessionType={sessionType}
            remainingSeconds={remainingSeconds}
            totalDuration={totalDuration}
            isRunning={isRunning}
            hasStarted={hasStarted}
            onTogglePlayPause={togglePlayPause}
            onSkip={skipSession}
            onReset={resetSession}
            onOpenManualBreak={() => setIsManualBreakModalOpen(true)}
            onRestore={() => {
              pipWindow.close();
              setPipWindow(null);
            }}
            isPiP={true}
          />,
          pipWindow.document.body
        )}

      {/* Footer */}
      <footer className="w-full text-center py-4 text-xs text-slate-500">
        <p>
          Continuous repeating countdown engine &bull; Press <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded font-mono text-[10px] text-slate-400">Space</kbd> to Start &bull; Press <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded font-mono text-[10px] text-slate-400">F</kbd> to Float
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
        onToggleFloating={toggleFloatingMode}
        onOpenPiP={openDesktopPiP}
        canPiP={canPiP}
      />
    </div>
  );
}
