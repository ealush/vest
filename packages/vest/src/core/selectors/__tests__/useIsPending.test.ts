import { describe, it, expect } from 'vitest';
import { VestRuntime } from 'vestjs-runtime';
import * as vest from '../../../vest';
import { useIsPending } from '../useIsPending';

describe('useIsPending', () => {
  it('Should return true if there are pending isolates in the runtime', () => {
    const suite = vest.create(() => {
      // Manually simulate a pending isolate in the runtime
      // This mimics a test running async
      const isolate = { id: '1', data: { fieldName: 'f1' } } as any;
      VestRuntime.registerPending(isolate);

      expect(useIsPending()).toBe(true);
      expect(useIsPending('f1')).toBe(true);
      expect(useIsPending('f2')).toBe(false); // Field filtering

      VestRuntime.removePending(isolate);
      expect(useIsPending()).toBe(false);
    });
    suite.run();
  });

  it('Should return false if there are no pending isolates', () => {
    const suite = vest.create(() => {
      expect(useIsPending()).toBe(false);
    });
    suite.run();
  });
});
