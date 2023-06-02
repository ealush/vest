import { isNullish } from 'vest-utils';

import { persist, useX } from 'VestRuntime';

export function useBus() {
  return useX().stateRef.Bus;
}

/*
  Returns an emitter, but it also has a shortcut for emitting an event immediately
  by passing an event name.
*/
export function useEmit(event?: string, data?: any) {
  const emit = useBus().emit;

  if (!isNullish(event)) {
    emit(event, data);
  }

  return persist(emit);
}

export function usePrepareEmitter<T = void>(event: string): (arg: T) => void {
  const emit = useEmit();

  return (arg: T) => emit(event, arg);
}
