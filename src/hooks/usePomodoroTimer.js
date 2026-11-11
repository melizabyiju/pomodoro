import { useState, useEffect, useRef, useCallback } from 'react';
import { playChime } from '../utils/audio';
import { sendDesktopNotification } from '../utils/notifications';
import { createTimerWorker } from '../utils/timerWorker';

export const SESSION_TYPES = {
  STUDY: 'STUDY',
  BREAK: 'BREAK',
  MANUAL_BREAK: 'MANUAL_BREAK',
};

export const DEFAULT_STUDY_SECONDS = 30 * 60; // 30 minutes = 1800s
export const DEFAULT_BREAK_SECONDS = 10 * 60; // 10 minutes = 600s

export function formatTime(seconds) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function usePomodoroTimer() {
  const [studyDuration, setStudyDuration] = useState(DEFAULT_STUDY_SECONDS);
  const [breakDuration, setBreakDuration] = useState(DEFAULT_BREAK_SECONDS);
  const [sessionType, setSessionType] = useState(SESSION_TYPES.STUDY);
  const [totalDuration, setTotalDuration] = useState(DEFAULT_STUDY_SECONDS);
  const [remainingSeconds, setRemainingSeconds] = useState(DEFAULT_STUDY_SECONDS);
  const [isRunning, setIsRunning] = useState(true);
  
  // Preserved session for manual break interruption
  const [interruptedSession, setInterruptedSession] = useState(null);

  // Sound and desktop notifications
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Stats
  const [stats, setStats] = useState(() => {
    try {
      const saved = localStorage.getItem('pomodoro_stats');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      completedStudySessions: 0,
      totalStudySeconds: 0,
      completedBreakSessions: 0,
      cycleCount: 0,
    };
  });

  // Target end timestamp in milliseconds
  const targetEndTimeRef = useRef(Date.now() + DEFAULT_STUDY_SECONDS * 1000);
  const isTransitioningRef = useRef(false);
  const remainingSecondsRef = useRef(remainingSeconds);
  const sessionTypeRef = useRef(sessionType);
  const isRunningRef = useRef(isRunning);
  const interruptedSessionRef = useRef(interruptedSession);
  const studyDurationRef = useRef(studyDuration);
  const breakDurationRef = useRef(breakDuration);
  const soundEnabledRef = useRef(soundEnabled);
  const notificationsEnabledRef = useRef(notificationsEnabled);

  // Keep refs synchronized
  useEffect(() => {
    remainingSecondsRef.current = remainingSeconds;
  }, [remainingSeconds]);

  useEffect(() => {
    sessionTypeRef.current = sessionType;
  }, [sessionType]);

  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  useEffect(() => {
    interruptedSessionRef.current = interruptedSession;
  }, [interruptedSession]);

  useEffect(() => {
    studyDurationRef.current = studyDuration;
  }, [studyDuration]);

  useEffect(() => {
    breakDurationRef.current = breakDuration;
  }, [breakDuration]);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    notificationsEnabledRef.current = notificationsEnabled;
  }, [notificationsEnabled]);

  // Persist stats
  useEffect(() => {
    try {
      localStorage.setItem('pomodoro_stats', JSON.stringify(stats));
    } catch {}
  }, [stats]);

  // Transition handler: executes exactly once per zero-countdown event
  const triggerTransition = useCallback(() => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    const currentType = sessionTypeRef.current;
    const now = Date.now();

    if (currentType === SESSION_TYPES.STUDY) {
      // 1. Study countdown reached 00:00 -> End study session
      // 2. Switch to BREAK
      // 3. Initialize break timer at breakDuration (10:00)
      // 4. Start counting down immediately
      const newBreakSecs = breakDurationRef.current;
      targetEndTimeRef.current = now + newBreakSecs * 1000;

      setStats((prev) => ({
        ...prev,
        completedStudySessions: prev.completedStudySessions + 1,
        totalStudySeconds: prev.totalStudySeconds + studyDurationRef.current,
      }));

      playChime('study-end', soundEnabledRef.current);
      if (notificationsEnabledRef.current) {
        sendDesktopNotification('Study Session Completed! 🎉', {
          body: `Great job! Your ${Math.round(studyDurationRef.current / 60)}-minute study session ended. Starting ${Math.round(newBreakSecs / 60)}-minute break now.`,
        });
      }

      setSessionType(SESSION_TYPES.BREAK);
      setTotalDuration(newBreakSecs);
      setRemainingSeconds(newBreakSecs);
      setIsRunning(true);
    } else if (currentType === SESSION_TYPES.BREAK) {
      // 1. Break countdown reached 00:00 -> End break
      // 2. Switch to STUDY
      // 3. Initialize study timer at studyDuration (30:00)
      // 4. Start counting down immediately
      const newStudySecs = studyDurationRef.current;
      targetEndTimeRef.current = now + newStudySecs * 1000;

      setStats((prev) => ({
        ...prev,
        completedBreakSessions: prev.completedBreakSessions + 1,
        cycleCount: prev.cycleCount + 1,
      }));

      playChime('break-end', soundEnabledRef.current);
      if (notificationsEnabledRef.current) {
        sendDesktopNotification('Break Ended! ⚡', {
          body: `Break finished! Initializing full ${Math.round(newStudySecs / 60)}-minute study session now. Let's focus!`,
        });
      }

      setSessionType(SESSION_TYPES.STUDY);
      setTotalDuration(newStudySecs);
      setRemainingSeconds(newStudySecs);
      setIsRunning(true);
    } else if (currentType === SESSION_TYPES.MANUAL_BREAK) {
      // Manual break reached 00:00 -> Resume interrupted session
      const interrupted = interruptedSessionRef.current;
      playChime('break-end', soundEnabledRef.current);
      if (notificationsEnabledRef.current) {
        sendDesktopNotification('Manual Break Ended! 🔔', {
          body: interrupted
            ? `Your manual break is done. Resuming ${interrupted.sessionType} session with ${formatTime(interrupted.remainingSeconds)} remaining.`
            : 'Manual break completed.',
        });
      }

      if (interrupted) {
        const resumeSecs = interrupted.remainingSeconds;
        targetEndTimeRef.current = now + resumeSecs * 1000;
        setSessionType(interrupted.sessionType);
        setTotalDuration(interrupted.totalDuration);
        setRemainingSeconds(resumeSecs);
        setInterruptedSession(null);
        setIsRunning(true);
      } else {
        // Fallback to normal study
        const newStudySecs = studyDurationRef.current;
        targetEndTimeRef.current = now + newStudySecs * 1000;
        setSessionType(SESSION_TYPES.STUDY);
        setTotalDuration(newStudySecs);
        setRemainingSeconds(newStudySecs);
        setIsRunning(true);
      }
    }

    // Release transition lock after small delay to avoid duplicate firing in tight loops
    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 200);
  }, []);

  // Sync tick logic
  const handleTick = useCallback(() => {
    if (!isRunningRef.current) return;
    if (isTransitioningRef.current) return;

    const targetTime = targetEndTimeRef.current;
    if (!targetTime) return;

    const now = Date.now();
    const diffMs = targetTime - now;

    if (diffMs <= 0) {
      setRemainingSeconds(0);
      triggerTransition();
    } else {
      const secondsLeft = Math.ceil(diffMs / 1000);
      setRemainingSeconds(secondsLeft);
    }
  }, [triggerTransition]);

  // Main ticker setup: Web Worker + window fallback + visibility sync
  useEffect(() => {
    // 1. Worker setup
    const worker = createTimerWorker(() => {
      handleTick();
    });

    if (worker) {
      worker.start(250);
    }

    // 2. High-precision fallback interval for safety
    const intervalId = setInterval(handleTick, 250);

    // 3. Document visibility & focus listeners for zero-drift background resume
    const onVisibilityOrFocus = () => {
      handleTick();
    };

    document.addEventListener('visibilitychange', onVisibilityOrFocus);
    window.addEventListener('focus', onVisibilityOrFocus);

    return () => {
      if (worker) {
        worker.stop();
        worker.terminate();
      }
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibilityOrFocus);
      window.removeEventListener('focus', onVisibilityOrFocus);
    };
  }, [handleTick]);

  // Document title updates with live MM:SS countdown
  useEffect(() => {
    const formatted = formatTime(remainingSeconds);
    const label = sessionType === SESSION_TYPES.STUDY ? 'STUDY' : sessionType === SESSION_TYPES.BREAK ? 'BREAK' : 'MANUAL BREAK';
    const statusPrefix = isRunning ? '' : '[PAUSED] ';
    document.title = `${statusPrefix}${formatted} - ${label} | Pomodoro`;
  }, [remainingSeconds, sessionType, isRunning]);

  // Pause
  const pauseTimer = useCallback(() => {
    if (!isRunningRef.current) return;
    const now = Date.now();
    const exactRemaining = Math.max(0, Math.ceil((targetEndTimeRef.current - now) / 1000));
    setRemainingSeconds(exactRemaining);
    setIsRunning(false);
    targetEndTimeRef.current = null;
  }, []);

  // Resume
  const resumeTimer = useCallback(() => {
    if (isRunningRef.current) return;
    const secondsToRun = remainingSecondsRef.current;
    targetEndTimeRef.current = Date.now() + secondsToRun * 1000;
    setIsRunning(true);
  }, []);

  const togglePlayPause = useCallback(() => {
    if (isRunning) {
      pauseTimer();
    } else {
      resumeTimer();
    }
  }, [isRunning, pauseTimer, resumeTimer]);

  // Reset current session to full configured duration
  const resetSession = useCallback(() => {
    const currentType = sessionTypeRef.current;
    let fullDuration = studyDurationRef.current;
    if (currentType === SESSION_TYPES.BREAK) {
      fullDuration = breakDurationRef.current;
    } else if (currentType === SESSION_TYPES.MANUAL_BREAK) {
      if (interruptedSessionRef.current) {
        // Cancel manual break and return to interrupted session
        const interrupted = interruptedSessionRef.current;
        setSessionType(interrupted.sessionType);
        setTotalDuration(interrupted.totalDuration);
        setRemainingSeconds(interrupted.remainingSeconds);
        setInterruptedSession(null);
        targetEndTimeRef.current = Date.now() + interrupted.remainingSeconds * 1000;
        setIsRunning(true);
        return;
      }
    }
    setTotalDuration(fullDuration);
    setRemainingSeconds(fullDuration);
    targetEndTimeRef.current = Date.now() + fullDuration * 1000;
    setIsRunning(true);
  }, []);

  // Skip current session directly to next session
  const skipSession = useCallback(() => {
    triggerTransition();
  }, [triggerTransition]);

  // Start a separate manual break
  const startManualBreak = useCallback((breakDurationSecs) => {
    const now = Date.now();
    const currentRemaining = isRunningRef.current && targetEndTimeRef.current
      ? Math.max(1, Math.ceil((targetEndTimeRef.current - now) / 1000))
      : remainingSecondsRef.current;

    // If already in a manual break, don't overwrite original interrupted session
    if (sessionTypeRef.current !== SESSION_TYPES.MANUAL_BREAK) {
      const saved = {
        sessionType: sessionTypeRef.current,
        remainingSeconds: currentRemaining,
        totalDuration: totalDuration,
      };
      setInterruptedSession(saved);
      interruptedSessionRef.current = saved;
    }

    setSessionType(SESSION_TYPES.MANUAL_BREAK);
    setTotalDuration(breakDurationSecs);
    setRemainingSeconds(breakDurationSecs);
    targetEndTimeRef.current = now + breakDurationSecs * 1000;
    setIsRunning(true);
  }, [totalDuration]);

  // Resume the preserved interrupted session immediately
  const resumeInterruptedSession = useCallback(() => {
    const interrupted = interruptedSessionRef.current;
    if (!interrupted) return;

    const resumeSecs = interrupted.remainingSeconds;
    targetEndTimeRef.current = Date.now() + resumeSecs * 1000;
    setSessionType(interrupted.sessionType);
    setTotalDuration(interrupted.totalDuration);
    setRemainingSeconds(resumeSecs);
    setInterruptedSession(null);
    setIsRunning(true);
  }, []);

  // Update default durations
  const updateDurations = useCallback((newStudyMin, newBreakMin) => {
    const newStudySec = Math.max(60, Math.floor(newStudyMin * 60));
    const newBreakSec = Math.max(60, Math.floor(newBreakMin * 60));
    
    setStudyDuration(newStudySec);
    setBreakDuration(newBreakSec);

    // If currently at full duration of respective type, adjust
    if (sessionType === SESSION_TYPES.STUDY) {
      setTotalDuration(newStudySec);
    } else if (sessionType === SESSION_TYPES.BREAK) {
      setTotalDuration(newBreakSec);
    }
  }, [sessionType]);

  const clearStats = useCallback(() => {
    const fresh = {
      completedStudySessions: 0,
      totalStudySeconds: 0,
      completedBreakSessions: 0,
      cycleCount: 0,
    };
    setStats(fresh);
    localStorage.removeItem('pomodoro_stats');
  }, []);

  return {
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
    pauseTimer,
    resumeTimer,
    resetSession,
    skipSession,
    startManualBreak,
    resumeInterruptedSession,
    updateDurations,
    clearStats,
  };
}
