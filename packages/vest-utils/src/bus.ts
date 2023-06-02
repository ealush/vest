import type { CB } from 'utilityTypes';

export function createBus(): BusType {
  const listeners: Record<string, CB[]> = {};

  return {
    emit(event: string, data: any) {
      listener(event).forEach(handler => {
        handler(data);
      });
    },

    on(event: string, handler: CB): OnReturn {
      listeners[event] = listener(event).concat(handler);

      return {
        off() {
          listeners[event] = listener(event).filter(h => h !== handler);
        },
      };
    },
  };

  function listener(event: string): CB[] {
    return listeners[event] || [];
  }
}

type OnReturn = { off: () => void };

export type BusType = {
  on: (event: string, handler: CB) => OnReturn;
  emit: (event: string, data: any) => void;
};
