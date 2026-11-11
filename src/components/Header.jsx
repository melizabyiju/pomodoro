import React from 'react';
import { Volume2, VolumeX, Bell, BellOff, Settings, PictureInPicture2 } from 'lucide-react';
import { requestNotificationPermission } from '../utils/notifications';

export default function Header({
  soundEnabled,
  setSoundEnabled,
  notificationsEnabled,
  setNotificationsEnabled,
  onOpenSettings,
  onToggleFloating,
}) {
  const handleToggleNotifications = async () => {
    if (!notificationsEnabled) {
      const res = await requestNotificationPermission();
      if (res === 'granted') {
        setNotificationsEnabled(true);
      } else {
        alert('Notification permission was not granted by your browser.');
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  return (
    <header className="w-full max-w-4xl mx-auto flex items-center justify-between py-4 px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 via-amber-500 to-emerald-400 p-[2px] shadow-lg shadow-rose-500/20">
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-xl">
            ⏳
          </div>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Pomodoro Flow
            <span className="text-[10px] font-semibold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full">
              Auto-Cycle
            </span>
          </h1>
          <p className="text-xs text-slate-400">Continuous 30m Study &bull; 10m Break Engine</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Floating Mini-Player Button */}
        <button
          onClick={onToggleFloating}
          title="Float mini-player (F)"
          aria-label="Float mini-player"
          className="p-2.5 rounded-xl bg-slate-900 border border-sky-800/60 text-sky-400 hover:text-white hover:border-sky-500 hover:bg-slate-850 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <PictureInPicture2 size={18} />
          <span className="hidden sm:inline text-xs font-semibold">Float</span>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
          aria-label={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
          className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
            soundEnabled
              ? 'bg-slate-900 border-slate-700 text-slate-200 hover:border-slate-500'
              : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:text-slate-400'
          }`}
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>

        {/* Notifications Toggle */}
        <button
          onClick={handleToggleNotifications}
          title={notificationsEnabled ? 'Disable Desktop Notifications' : 'Enable Desktop Notifications'}
          aria-label={notificationsEnabled ? 'Disable Notifications' : 'Enable Notifications'}
          className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
            notificationsEnabled
              ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300 hover:border-emerald-500'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          {notificationsEnabled ? <Bell size={18} /> : <BellOff size={18} />}
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          title="Timer Settings"
          aria-label="Settings"
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white transition-all cursor-pointer"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}
