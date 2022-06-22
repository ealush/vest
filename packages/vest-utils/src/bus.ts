import { CB } from 'utilityTypes';

export function createBus(): {
  on: (event: string, handler: CB) => OnReturn;
  emit: (event: string, ...args: any[]) => void;
} {
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
