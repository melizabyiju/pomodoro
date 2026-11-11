import React, { useState } from 'react';
import { X, Sliders, Volume2, Bell, Cpu, Check, RotateCcw } from 'lucide-react';
import { playChime } from '../utils/audio';
import { requestNotificationPermission, sendDesktopNotification } from '../utils/notifications';

export default function SettingsModal({
  isOpen,
  onClose,
  studyDuration,
  breakDuration,
  onSaveDurations,
  soundEnabled,
  setSoundEnabled,
  notificationsEnabled,
  setNotificationsEnabled,
}) {
  const [studyMin, setStudyMin] = useState(Math.round(studyDuration / 60));
  const [breakMin, setBreakMin] = useState(Math.round(breakDuration / 60));

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSaveDurations(studyMin, breakMin);
    onClose();
  };

  const handleResetDefaults = () => {
    setStudyMin(30);
    setBreakMin(10);
    onSaveDurations(30, 10);
  };

  const handleTestStudySound = () => {
    playChime('study-end', true);
  };

  const handleTestBreakSound = () => {
    playChime('break-end', true);
  };

  const handleTestNotification = async () => {
    const res = await requestNotificationPermission();
    if (res === 'granted') {
      setNotificationsEnabled(true);
      sendDesktopNotification('Test Notification 🔔', {
        body: 'Pomodoro timer notifications are working correctly!',
      });
    } else {
      alert('Notification permission not granted.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400">
            <Sliders size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Timer Configuration</h2>
            <p className="text-xs text-slate-400">Durations and precision engine</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Durations */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Study Duration (min)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={studyMin}
                onChange={(e) => setStudyMin(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-900 border border-slate-750 rounded-xl px-3 py-2 text-white font-mono font-bold text-lg focus:outline-none focus:border-rose-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Default: 30 minutes</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Break Duration (min)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={breakMin}
                onChange={(e) => setBreakMin(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-900 border border-slate-750 rounded-xl px-3 py-2 text-white font-mono font-bold text-lg focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Default: 10 minutes</span>
            </div>
          </div>

          {/* Sound & Notifications Testing */}
          <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
              Audio & Alerts
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleTestStudySound}
                className="px-3 py-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 text-xs text-slate-200 flex items-center gap-1.5 cursor-pointer"
              >
                <Volume2 size={14} className="text-rose-400" />
                Test Study Chime
              </button>
              <button
                type="button"
                onClick={handleTestBreakSound}
                className="px-3 py-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 text-xs text-slate-200 flex items-center gap-1.5 cursor-pointer"
              >
                <Volume2 size={14} className="text-emerald-400" />
                Test Break Chime
              </button>
              <button
                type="button"
                onClick={handleTestNotification}
                className="px-3 py-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 text-xs text-slate-200 flex items-center gap-1.5 cursor-pointer"
              >
                <Bell size={14} className="text-amber-400" />
                Test Notification
              </button>
            </div>
          </div>

          {/* Precision Engine Badge */}
          <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-900/40 flex items-start gap-3">
            <Cpu className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-indigo-200/80 leading-relaxed">
              <span className="font-semibold text-indigo-200">Hardware Timestamp + Web Worker Active:</span>{' '}
              Countdown stays exact with zero drift even when the tab is hidden, minimized, or running in the background.
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-3">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw size={12} />
              Reset 30m / 10m Defaults
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg cursor-pointer"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
