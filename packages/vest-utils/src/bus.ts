import type { CB } from 'utilityTypes';

const EVENT_WILDCARD = '*';

export function createBus(): BusType {
  const listeners: Record<string, CB[]> = {};

  return {
    emit(event: string, data?: any) {
      getListeners(event)
        .concat(getListeners(EVENT_WILDCARD))
        .forEach(handler => {
          handler(data);
        });
    },

    on(event: string, handler: CB): OnReturn {
      listeners[event] = getListeners(event).concat(handler);

      return {
        off() {
          listeners[event] = getListeners(event).filter(h => h !== handler);
        },
      };
    },
  };

  function getListeners(event: string): CB[] {
    return listeners[event] || [];
  }
}

type OnReturn = { off: CB<void> };

export type BusType = {
  on: (event: string, handler: CB) => OnReturn;
  emit: (event: string, data?: any) => void;
};
