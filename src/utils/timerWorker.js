/**
 * Creates an inline Web Worker that fires ticks without being throttled
 * as aggressively by background tab power-saving mechanisms.
 */

const workerCode = `
  let timerId = null;

  self.onmessage = function(e) {
    const { action, interval = 250 } = e.data;
    if (action === 'start') {
      if (timerId) clearInterval(timerId);
      timerId = setInterval(() => {
        self.postMessage({ type: 'tick', timestamp: Date.now() });
      }, interval);
    } else if (action === 'stop') {
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
    }
  };
`;

export function createTimerWorker(onTick) {
  if (typeof window === 'undefined' || typeof Worker === 'undefined') {
    return null;
  }

  try {
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl);

    worker.onmessage = (event) => {
      if (event.data?.type === 'tick') {
        onTick(event.data.timestamp);
      }
    };

    return {
      start: (interval = 250) => {
        worker.postMessage({ action: 'start', interval });
      },
      stop: () => {
        worker.postMessage({ action: 'stop' });
      },
      terminate: () => {
        worker.terminate();
        URL.revokeObjectURL(workerUrl);
      }
    };
  } catch (err) {
    console.warn('Web Worker initialization failed, fallback to main thread timer:', err);
    return null;
  }
}
