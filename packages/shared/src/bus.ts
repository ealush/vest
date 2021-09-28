export function createBus(): {
  on: (event: string, handler: (...args: any[]) => void) => { off: () => void };
  emit: (event: string, ...args: any[]) => void;
} {
  const listeners: Record<string, ((...args: any[]) => void)[]> = {};

  return {
    emit(event: string, data: any) {
      if (!listeners[event]) {
        return;
      }

      listeners[event].forEach(listener => {
        listener(data);
      });
    },

    on(event: string, handler: (...args: any[]) => void): { off: () => void } {
      if (!listeners[event]) {
        listeners[event] = [];
      }

      listeners[event].push(handler);

      return {
        off() {
          listeners[event] = listeners[event].filter(h => h !== handler);
        },
      };
    },
  };
}
