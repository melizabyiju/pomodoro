# ⏳ Pomodoro Flow - Continuous Repeating Countdown & Automatic Session Engine

A high-precision, distraction-free Pomodoro web application engineered with an automatic, infinite session transition cycle and hardware timestamp countdown engine.

## 🚀 Key Features

### 1. Continuous Repeating Countdown & Automatic Session Transitions
- **Default Durations**:
  - **Study Session**: 30 minutes (`1800` seconds).
  - **Break Session**: 10 minutes (`600` seconds).
- **Live MM:SS Countdown**: Real-time decrementing countdown display (`30:00 → 29:59 → 29:58 ... → 00:01 → 00:00`).
- **Zero-Friction Automatic Transition**:
  - When Study reaches `00:00`, the session ends automatically, switches state to **BREAK**, initializes break at `10:00`, and starts counting down immediately.
  - When Break reaches `00:00`, the break ends automatically, switches state to **STUDY**, initializes study at `30:00`, and starts counting down immediately.
  - Continues indefinitely:
    ```
    30:00 STUDY ➔ 10:00 BREAK ➔ 30:00 STUDY ➔ 10:00 BREAK ➔ 30:00 STUDY ...
    ```
  - **No static duration displays**, no manual intervention required between cycles, and no unwanted long-break interruptions or unexpected session shortening.

### 2. Manual Interruption & Preserved Sessions
- **Pause & Resume at Any Second**:
  - Freeze the exact remaining countdown time instantly.
  - Preserves session state without advancing to the next cycle.
  - Resume from the exact preserved second.
- **Dedicated Manual Break Options**:
  - Quick presets: **5 minutes**, **10 minutes**, **15 minutes**, **20 minutes**, **30 minutes**, and **Custom Duration**.
  - Temporarily interrupts the normal cycle, safely storing the interrupted session's remaining time.
  - Clearly displays a banner with the preserved session and time remaining.
  - Allows one-click return to resume the interrupted session at any point.

### 3. Technical Accuracy & Background Drift Prevention
- **Timestamp-Based Countdown Engine**: Calculates delta from target completion timestamps (`Date.now()`) rather than relying purely on browser `setInterval`, preventing timer drift.
- **Dedicated Inline Web Worker**: Runs on an independent thread, maintaining reliable tick events when the window is minimized, hidden in background tabs, or throttled by operating system energy savers.
- **Page Visibility & Focus Synchronization**: Re-syncs time immediately on window focus and tab switching.
- **Atomic Transition Guard**: Prevents race conditions, duplicate transitions, and overlapping timers.
- **Live Document Title**: Reflects real-time `(MM:SS) [SESSION] - Pomodoro` countdown in browser tabs.
- **Zero-Dependency Web Audio API Chimes**: Harmonic ascending notification chimes for study completion and focus alerts for break completion.
- **Desktop Notification API Support**: Optional native browser notifications on session completion.

---

## 🛠️ Tech Stack
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Audio**: Web Audio API (Synthesized harmonic frequencies)
- **Concurrency**: Web Workers API + Page Visibility API

---

## 📦 Getting Started

### Installation
```bash
git clone https://github.com/melizabyiju/pomodoro.git
cd pomodoro
npm install
```

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

---

## ⌨️ Keyboard Shortcuts
- <kbd>Space</kbd> : Play / Pause countdown
- <kbd>R</kbd> : Reset current session to full duration
- <kbd>S</kbd> : Skip to next session
- <kbd>M</kbd> : Open manual break menu
