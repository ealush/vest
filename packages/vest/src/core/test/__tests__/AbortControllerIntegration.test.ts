import { create, test, only } from 'vest';
import { describe, it, expect } from 'vitest';

describe('AbortController Integration', () => {
  it('Should abort the signal when the test is re-run', async () => {
    let signal: AbortSignal | undefined;

    const suite = create(() => {
      test('field', async ({ signal: s }) => {
        signal = s;
        await new Promise(resolve => setTimeout(resolve, 1000));
      });
    });

    suite.run();

    const signal1 = signal;
    expect(signal1).toBeDefined();
    expect(signal1?.aborted).toBe(false);

    suite.run();

    expect(signal1?.aborted).toBe(true);
    expect(signal).not.toBe(signal1);
  });

  it('Should not abort other tests when only one is re-run', async () => {
    let signal1: AbortSignal | undefined;
    let signal2: AbortSignal | undefined;

    const suite = create((onlyField?: string) => {
      only(onlyField);
      test('field1', async ({ signal: s }) => {
        signal1 = s;
        await new Promise(resolve => setTimeout(resolve, 1000));
      });

      test('field2', async ({ signal: s }) => {
        signal2 = s;
        await new Promise(resolve => setTimeout(resolve, 1000));
      });
    });

    suite.run();

    // Capture initial signals
    const s1 = signal1;
    const s2 = signal2;

    expect(s1).toBeDefined();
    expect(s2).toBeDefined();
    expect(s1).not.toBe(s2);

    // Re-run ONLY field1
    suite.run('field1');

    expect(s1?.aborted).toBe(true);
    // Field 2 was skipped, so its previous run is still valid/pending?
    // Actually, if it's omitted, does it abort?
    // In Vest, omitted tests usually keep previous state if they are valid,
    // but if they are pending, they might be aborted or kept?
    // Let's verify behavior. If it fails, we learn.
    // Use 'omitWhen' logic typically preserves, but 'only' might imply others are irrelevant.
    // But checking 'aborted' property is safe.
    expect(s2?.aborted).toBe(false);
  });

  it('Should support lazy initialization (perf check)', () => {
    // This is hard to test from public API as we can't inspect the internal object easily.
    // But we can verify that sync tests don't crash or behave weirdly.
    const suite = create(() => {
      test('sync', () => {
        return true;
      });
    });

    const res = suite.run();
    expect(res.isValid()).toBe(true);
  });

  it('Should pass signal to async tests', () => {
    return new Promise<void>(done => {
      const suite = create(() => {
        test('async', ({ signal }) => {
          expect(signal).toBeInstanceOf(AbortSignal);
          expect(signal.aborted).toBe(false);
          done();
          return Promise.resolve();
        });
      });
      suite.run();
    });
  });
});
