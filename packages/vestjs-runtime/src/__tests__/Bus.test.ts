import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useBus, useEmit, usePrepareEmitter } from '../Bus';
import { Run, createRef, StateRefType } from '../VestRuntime';

describe('Bus', () => {
  let ref: StateRefType;

  beforeEach(() => {
    ref = createRef(vi.fn(), {});
  });

  const withRun = (fn: () => void) => {
    Run(ref, fn);
  };

  describe('useBus', () => {
    it('Should return the bus instance', () => {
      withRun(() => {
        expect(useBus()).toBe(ref.Bus);
      });
    });
  });

  describe('useEmit', () => {
    it('Should return the emit function checking spy', () => {
      // We must attach spy BEFORE useEmit is called because useEmit captures the function
      const spy = vi.spyOn(ref.Bus, 'emit');

      withRun(() => {
        const emit = useEmit();
        emit('test', 'payload');
        expect(spy).toHaveBeenCalledWith('test', 'payload');
      });
    });

    it('Should emit immediately if event name is provided', () => {
      const spy = vi.spyOn(ref.Bus, 'emit');

      withRun(() => {
        // @ts-expect-error - Testing with a non-RuntimeEvents event name
        useEmit('immediate', 123);
        expect(spy).toHaveBeenCalledWith('immediate', 123);
      });
    });
  });

  describe('usePrepareEmitter', () => {
    it('Should return a function that emits the specific event', () => {
      const spy = vi.spyOn(ref.Bus, 'emit');

      withRun(() => {
        const emitter = usePrepareEmitter<Record<string, string>>('prepared');
        emitter('data');
        expect(spy).toHaveBeenCalledWith('prepared', 'data');
      });
    });
  });
});
