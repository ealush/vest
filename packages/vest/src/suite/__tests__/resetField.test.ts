import { describe, it, expect, beforeEach } from 'vitest';

import { TTestSuite } from '../../testUtils/TVestMock';
import { create, test } from '../../vest';

describe('suite.resetField', () => {
  let suite: TTestSuite;

  beforeEach(() => {
    suite = create(() => {
      test('field1', 'f1 error', () => false);
      test('field2', 'f2 error', () => false);
    });
    suite.run();
  });

  it('should reset the validity state of a field', () => {
    expect(suite.get().hasErrors('field1')).toBe(true);
    expect(suite.get().hasErrors('field2')).toBe(true);
    expect(suite.get().getErrors('field1')).toEqual(['f1 error']);
    expect(suite.get().getErrors('field2')).toEqual(['f2 error']);
    suite.resetField('field1');
    expect(suite.get().hasErrors('field1')).toBe(false);
    expect(suite.get().hasErrors('field2')).toBe(true);
    expect(suite.get().getErrors('field1')).toEqual([]);
    expect(suite.get().getErrors('field2')).toEqual(['f2 error']);
    suite.resetField('field2');
    expect(suite.get().hasErrors('field1')).toBe(false);
    expect(suite.get().hasErrors('field2')).toBe(false);
    expect(suite.get().getErrors('field1')).toEqual([]);
    expect(suite.get().getErrors('field2')).toEqual([]);
  });

  it('should refresh the suite result', () => {
    const res = suite.get();
    expect(res).toBe(suite.get());
    suite.resetField('field1');
    expect(res).not.toBe(suite.get());
  });

  it('should allow the field to keep updating (no final status)', () => {
    suite.resetField('field1');
    expect(suite.get().hasErrors('field1')).toBe(false);
    expect(suite.get().hasErrors('field2')).toBe(true);
    suite.run();
    expect(suite.get().hasErrors('field1')).toBe(true);
    expect(suite.get().hasErrors('field2')).toBe(true);
  });

  it('sanity', () => {
    expect(suite.get().tests).toMatchInlineSnapshot(`
      {
        "field1": SummaryBase {
          "errorCount": 1,
          "errors": [
            "f1 error",
          ],
          "pendingCount": 0,
          "success": [],
          "successCount": 0,
          "testCount": 1,
          "valid": false,
          "warnCount": 0,
          "warnings": [],
        },
        "field2": SummaryBase {
          "errorCount": 1,
          "errors": [
            "f2 error",
          ],
          "pendingCount": 0,
          "success": [],
          "successCount": 0,
          "testCount": 1,
          "valid": false,
          "warnCount": 0,
          "warnings": [],
        },
      }
    `);
  });
});

describe('suite.resetField with pending async tests', () => {
  function deferred() {
    let release: () => void = () => {};
    const promise = new Promise<void>(resolve => {
      release = resolve;
    });
    return { promise, release };
  }

  function flush(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 0));
  }

  it('does not let late async work resurrect the reset field', async () => {
    const gate = deferred();
    const suite = create(() => {
      test('field1', 'late failure', async () => {
        await gate.promise;
        throw new Error();
      });
      test('field2', 'f2 error', () => false);
    });
    suite.run();
    expect(suite.get().isPending('field1')).toBe(true);

    suite.resetField('field1');
    gate.release();
    await flush();

    expect(suite.get().hasErrors('field1')).toBe(false);
    expect(suite.get().isPending()).toBe(false);
    expect(suite.get().hasErrors('field2')).toBe(true);
    // Same summary as resetting a field that already finished.
    expect(suite.get().isTested('field1')).toBe(false);
  });

  it('validates the field again on the next run', async () => {
    const gate = deferred();
    let release = true;
    const suite = create(() => {
      test('field1', 'failure', async () => {
        if (release) await gate.promise;
        throw new Error();
      });
    });
    suite.run();
    suite.resetField('field1');
    gate.release();
    await flush();

    release = false;
    await suite.run();
    expect(suite.get().hasErrors('field1')).toBe(true);
  });

  it.each(['failure', 'success'] as const)(
    'keeps a canceled test canceled across repeated resets before late %s',
    async (outcome: 'failure' | 'success') => {
      const gate = deferred();
      const suite = create(() => {
        test('field1', 'late failure', async () => {
          await gate.promise;
          if (outcome === 'failure') throw new Error();
        });
      });
      suite.run();
      suite.resetField('field1');
      suite.resetField('field1');
      gate.release();
      await flush();

      expect(suite.get().hasErrors('field1')).toBe(false);
      expect(suite.get().isPending('field1')).toBe(false);
      expect(suite.get().isTested('field1')).toBe(false);
    },
  );

  it.each(['reset', 'remove'] as const)(
    'matches %s, which already drops late work',
    async (operation: 'reset' | 'remove') => {
      const gate = deferred();
      const suite = create(() => {
        test('field1', 'late failure', async () => {
          await gate.promise;
          throw new Error();
        });
      });
      suite.run();
      if (operation === 'reset') suite.reset();
      else suite.remove('field1');
      gate.release();
      await flush();
      expect(suite.get().hasErrors('field1')).toBe(false);
    },
  );
});
