import type { CB } from './utilityTypes';

const EVENT_WILDCARD = '*';

export function createBus<TEvents extends string = string>(): BusType<TEvents> {
  const listeners: Record<TEvents | TEventsWildcard, CB[]> = {} as Record<
    TEvents | TEventsWildcard,
    CB[]
  >;

  return {
    emit(event: TEvents | '*', data?: any) {
      getListeners(event)
        .concat(getListeners(EVENT_WILDCARD as TEvents | '*'))
        .forEach(handler => {
          handler(data);
        });
    },

    on(event: TEvents | TEventsWildcard, handler: CB): OnReturn {
      listeners[event] = getListeners(event).concat(handler);

      return {
        off() {
          listeners[event] = getListeners(event).filter(h => h !== handler);
        },
      };
    },
  };

  function getListeners(event: TEvents | TEventsWildcard): CB[] {
    return listeners[event] || [];
  }
}

type OnReturn = { off: CB<void> };

export type BusType<TEvents extends string = string> = {
  on: (event: TEvents | TEventsWildcard, handler: CB) => OnReturn;
  emit: (event: TEvents | TEventsWildcard, data?: any) => void;
};

type TEventsWildcard = '*';
