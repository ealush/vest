export function createBus(): {
  on: (event: string, handler: (...args: any[]) => void) => { off: () => void };
  emit: (event: string, ...args: any[]) => void;
} {
  const listeners: Record<string, ((...args: any[]) => void)[]> = {};

  return {
    emit(event: string, data: any) {
      (listeners[event] || []).forEach(handler => {
        handler(data);
      });
    },

    on(event: string, handler: (...args: any[]) => void): { off: () => void } {
      listeners[event] = (listeners[event] || []).concat(handler);

      return {
        off() {
          listeners[event] = listeners[event].filter(h => h !== handler);
        },
      };
    },
  };
}
