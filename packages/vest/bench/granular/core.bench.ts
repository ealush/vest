import { bench, describe } from 'vitest';
import { create, test, enforce, warn } from '../../src/vest';
import { memo } from '../../src/exports/memo';
import { TFieldName } from '../../src/suiteResult/SuiteResultTypes';

// --- Core Test Functionality ---

const suiteSyncPassing = create(() => {
  test('pass', () => {
    enforce(1).equals(1);
  });
});

const suiteSyncFailing = create(() => {
  test('fail', () => {
    enforce(1).equals(2);
  });
});

const suiteSyncWarning = create(() => {
  test('warn', () => {
    warn();
    enforce(1).equals(2);
  });
});

const suiteMemoHit = create(() => {
  memo(() => {
    test('memo_hit', () => {
      enforce(1).equals(1);
    });
  }, [1]);
});

const suiteMemoMiss = create((dep: any) => {
  memo(() => {
    test('memo_miss', () => {
      enforce(1).equals(1);
    });
  }, [dep]);
});

const suiteAsyncImmediate = create(() => {
  test('async_immediate', async () => {
    await Promise.resolve();
  });
});

const suiteAsyncDelayed = create(() => {
  test('async_delayed', async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });
});

const suiteAsyncReject = create(() => {
  test('async_reject', async () => {
    try {
      await Promise.reject(new Error('fail'));
    } catch {
      // ignore
    }
  });
});

const suiteHighVolSame = create(() => {
  for (let i = 0; i < 1000; i++) {
    test('same_name' as TFieldName, () => {});
  }
});

const suiteHighVolUnique = create(() => {
  for (let i = 0; i < 1000; i++) {
    test(`unique_${i}` as TFieldName, () => {});
  }
});

describe('Core Test Functionality', () => {
  bench('test (Sync, Passing)', () => {
    suiteSyncPassing.run();
  });
  bench('test (Sync, Failing)', () => {
    suiteSyncFailing.run();
  });
  bench('test (Sync, Warning)', () => {
    suiteSyncWarning.run();
  });
  bench('test.memo (Cache Hit)', () => {
    suiteMemoHit.run();
    suiteMemoHit.run();
  });
  bench('test.memo (Cache Miss)', () => {
    suiteMemoMiss.run({});
  });
  bench('test (Async, Immediate Resolve)', () => {
    suiteAsyncImmediate.run();
  });
  bench('test (Async, Delayed Resolve)', () => {
    suiteAsyncDelayed.run();
  });
  bench('test (Async, Rejection)', () => {
    suiteAsyncReject.run();
  });
  bench('test (High Volume, Same Name)', () => {
    suiteHighVolSame.run();
  });
  bench('test (High Volume, Unique Names)', () => {
    suiteHighVolUnique.run();
  });
});
