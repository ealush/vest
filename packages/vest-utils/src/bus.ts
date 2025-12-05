import type { CB } from './utilityTypes';

const EVENT_WILDCARD = '*';
type TEventsWildcard = typeof EVENT_WILDCARD;

export function createBus<
  TEvents extends Record<string, any> = Record<string, any>,
>(): BusType<TEvents> {
  const listeners = {} as Record<keyof TEvents | TEventsWildcard, CB[]>;

  return {
    emit(event: keyof TEvents | TEventsWildcard, payload?: any) {
      getListeners(event)
        .concat(getListeners(EVENT_WILDCARD))
        .forEach(handler => {
          handler(payload);
        });
    },

    on(event: keyof TEvents | TEventsWildcard, handler: CB): OnReturn {
      listeners[event] = getListeners(event).concat(handler);

      return {
        off() {
          listeners[event] = getListeners(event).filter(h => h !== handler);
        },
      };
    },
  };

  function getListeners(event: keyof TEvents | TEventsWildcard): CB[] {
    return listeners[event] || [];
  }
}

type OnReturn = { off: CB<void> };

export type BusType<TEvents extends Record<string, any>> = {
  on<T extends keyof TEvents>(
    event: T,
    handler: (payload: TEvents[T]) => void,
  ): OnReturn;
  on(event: TEventsWildcard, handler: (payload: any) => void): OnReturn;

  emit<T extends keyof TEvents>(
    event: T,
    ...args: TEvents[T] extends void
      ? [payload?: TEvents[T]]
      : [payload: TEvents[T]]
  ): void;
  emit(event: TEventsWildcard, payload?: any): void;
};
