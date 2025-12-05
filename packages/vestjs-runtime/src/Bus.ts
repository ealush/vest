import { BusType, isNullish } from 'vest-utils';

import { persist, useX } from './VestRuntime';
import { RuntimeEvents } from './RuntimeEvents';

export function useBus<
  E extends Record<string, any> = RuntimeEvents,
>(): BusType<E> {
  return useX().stateRef.Bus as unknown as BusType<E>;
}

/*
  Returns an emitter, but it also has a shortcut for emitting an event immediately
  by passing an event name.
*/
export function useEmit<
  E extends Record<string, any> = RuntimeEvents,
>(): BusType<E>['emit'];
export function useEmit<
  E extends Record<string, any> = RuntimeEvents,
  T extends keyof E = keyof E,
>(
  event: T,
  ...args: E[T] extends void ? [payload?: E[T]] : [payload: E[T]]
): void;
export function useEmit(event?: string, data?: any): any {
  const emit = useBus().emit;

  if (!isNullish(event)) {
    // @ts-ignore - We're allowing any event name here because the bus might be extended
    emit(event, data);
  }

  return persist(emit);
}

export function usePrepareEmitter<
  E extends Record<string, any> = RuntimeEvents,
  T extends keyof E = keyof E,
>(event: T): (arg: E[T]) => void {
  const emit = useEmit<E>();

  return (arg: E[T]) => emit(event, arg);
}
