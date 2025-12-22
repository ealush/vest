import { bench, describe } from 'vitest';
import {
  create,
  test,
  enforce,
  group,
  only,
  skipWhen,
  omitWhen,
  include,
  mode,
  Modes,
  each,
} from '../src/vest';
import { memo } from '../src/exports/memo';
import { SuiteSerializer } from '../src/exports/SuiteSerializer';
import { TFieldName, TGroupName } from '../src/suiteResult/SuiteResultTypes';

// --- Reconciler & History Diffing ---

const reconcilerSuite = create((items: number[]) => {
  // @ts-ignore
  each(items, item => {
    test(`item_${item}` as TFieldName, () => {
      enforce(item).isNumeric();
    });
  });
});

const items1000 = Array.from({ length: 1000 }, (_, i) => i);
const items1000Reverse = [...items1000].reverse();
const items1000Shuffled = [...items1000].sort(() => Math.random() - 0.5);
const items1001Prepend = [-1, ...items1000];
const items1001Append = [...items1000, 1000];
const items1000Interleaved = items1000.map(i => (i % 2 === 0 ? i : i + 10000));
const itemsZero: number[] = [];

// Initialize history
reconcilerSuite.run(items1000);

describe('Reconciler & History Diffing', () => {
  bench('Reconciler (Stable List)', () => {
    reconcilerSuite.run(items1000);
  });

  bench('Reconciler (Full Invalidation)', () => {
    // Changing keys/dependencies implicitly by changing inputs if they were dependencies,
    // but here we change the structure/identities effectively by supplying different primitives if we used them as keys.
    // 'each' uses the item as key by default if primitive.
    reconcilerSuite.run(items1000Reverse);
  });

  bench('Reconciler (Prepend Item)', () => {
    reconcilerSuite.run(items1001Prepend);
  });

  bench('Reconciler (Append Item)', () => {
    reconcilerSuite.run(items1001Append);
  });

  bench('Reconciler (Interleaved)', () => {
    reconcilerSuite.run(items1000Interleaved);
  });

  bench('Isolate Reordering (Reverse)', () => {
    reconcilerSuite.run(items1000Reverse);
  });

  bench('Isolate Reordering (Shuffle)', () => {
    reconcilerSuite.run(items1000Shuffled);
  });

  bench('Orphan GC Pressure', () => {
    reconcilerSuite.run(itemsZero);
    reconcilerSuite.run(items1000); // Re-populate for next run reliability if needed, or primarily measure the drop.
  });
});

// --- Result Selectors & Reporting ---

const selectorSuite = create(() => {
  for (let i = 0; i < 1000; i++) {
    test(`field_${i}` as TFieldName, () => {
      if (i % 2 === 0) enforce(1).equals(2); // mixed failures
    });
  }
  group('g1' as TGroupName, () => {
    test('g_field', () => {});
  });
});
const selRes = selectorSuite.run();

describe('Result Selectors & Reporting', () => {
  bench('isValid (Volume)', () => {
    for (let i = 0; i < 10000; i++) {
      selRes.isValid();
    }
  });

  bench('hasErrors (Volume)', () => {
    for (let i = 0; i < 10000; i++) {
      selRes.hasErrors();
    }
  });

  bench('getErrors (Deep Lookup)', () => {
    selRes.getErrors('field_999');
  });

  bench('getErrors (Group Lookup)', () => {
    for (let i = 0; i < 10000; i++) {
      selRes.getErrorsByGroup('g1');
    }
  });

  // suite.get() is usually internal or deprecated in favor of just the result object which is returned by run().
  // benchmarking the result production logic which happens on run().
  bench('Summary Generation (Large)', () => {
    selectorSuite.run();
  });
});

// --- Async & Concurrency Stress ---

const suitePending = create(() => {
  for (let i = 0; i < 1000; i++) {
    test('pending', async () => new Promise<void>(() => {}));
  }
});

const suiteResolve = create(() => {
  for (let i = 0; i < 1000; i++) {
    test('resolve', async () => Promise.resolve());
  }
});

const suiteReject = create(() => {
  for (let i = 0; i < 1000; i++) {
    test('reject', async () => Promise.reject('').catch(() => {}));
  }
});

const suiteRace = create(() => {
  for (let i = 0; i < 100; i++) {
    test('race', async () =>
      new Promise<void>(res => setTimeout(res, Math.random() * 10)));
  }
});

const suiteAsyncMemoHit = create(() => {
  memo(() => {
    test('async_memo', async () => {});
  }, [1]);
});
suiteAsyncMemoHit.run(); // prep cache

describe('Async & Concurrency Stress', () => {
  bench('Pending Storm (Memory)', () => {
    suitePending.run();
  });
  bench('Resolve Storm (Throughput)', () => {
    suiteResolve.run();
  });
  bench('Reject Storm', () => {
    suiteReject.run();
  });
  bench('Async Race', () => {
    suiteRace.run();
  });
  bench('test.memo (Async Hit)', () => {
    suiteAsyncMemoHit.run();
  });
});

// --- Control Flow & Hooks Internals ---

const suiteMemoThrash = create(dep => {
  for (let i = 0; i < 100; i++) {
    memo(() => {
      test('t', () => {});
    }, [dep, i]);
  }
});

const suiteMemoStagnant = create(() => {
  for (let i = 0; i < 100; i++) {
    memo(() => {
      test('t', () => {});
    }, [1]);
  }
});

const suiteIncludeChain = create(() => {
  for (let i = 0; i < 50; i++) {
    include('a' as TFieldName).when('b' as TFieldName);
  }
});

const suiteOmitWhenActive = create(() => {
  omitWhen(true, () => {
    for (let i = 0; i < 1000; i++) test('t', () => {});
  });
});

const suiteSkipWhenActive = create(() => {
  skipWhen(true, () => {
    for (let i = 0; i < 1000; i++) test('t', () => {});
  });
});

const suiteOnlyEarly = create(() => {
  only('t_0' as TFieldName);
  for (let i = 0; i < 1000; i++) test(`t_${i}` as TFieldName, () => {});
});

const suiteOnlyLate = create(() => {
  only('t_999' as TFieldName);
  for (let i = 0; i < 1000; i++) test(`t_${i}` as TFieldName, () => {});
});

describe('Control Flow & Hooks Internals', () => {
  bench('test.memo (Thrashing)', () => {
    suiteMemoThrash.run({});
  });
  bench('test.memo (Stagnation)', () => {
    suiteMemoStagnant.run();
  });
  bench('include Chain', () => {
    suiteIncludeChain.run();
  });
  bench('omitWhen (Active)', () => {
    suiteOmitWhenActive.run();
  });
  bench('skipWhen (Active)', () => {
    suiteSkipWhenActive.run();
  });
  bench('only Starvation (Early)', () => {
    suiteOnlyEarly.run();
  });
  bench('only Starvation (Late)', () => {
    suiteOnlyLate.run();
  });
});

// --- VestBus & Internal Events ---
// Simulating bus load via high volume updates

const suiteBusLoad = create(() => {
  for (let i = 0; i < 100; i++) test('t', () => {});
});

describe('VestBus & Internals', () => {
  bench('Bus Scaling', () => {
    suiteBusLoad.run();
  });
  bench('State Refill', () => {
    // Persist/Hydrate via library public API
    const s = suiteBusLoad.run();
    SuiteSerializer.resume(suiteBusLoad, SuiteSerializer.serialize(s));
  });
});

// --- Memory & Object Lifecycle ---

describe('Memory & Object Lifecycle', () => {
  bench('Suite Factory', () => {
    create(() => {});
  });

  bench('Test Object Allocator', () => {
    create(() => {
      for (let i = 0; i < 1000; i++) test('t', () => {});
    }).run();
  });

  bench('Garbage Collection Friendly', () => {
    const s = create(() => {
      for (let i = 0; i < 1000; i++) test('t', () => {});
    });
    s.run();
  });
});

// --- Serialization ---
const serRes = selectorSuite.run();

describe('Serialization', () => {
  bench('Serialize (Large)', () => {
    SuiteSerializer.serialize(serRes);
  });
  bench('Deserialize (Large)', () => {
    SuiteSerializer.deserialize(SuiteSerializer.serialize(serRes));
  });
});

// --- Edge Cases & Integration ---

const suiteDeepNest = create(() => {
  const rec = (d: number) => {
    if (d === 0) return;
    group('g' as TGroupName, () => rec(d - 1));
  };
  rec(100);
});

const suiteBroadGroup = create(() => {
  group('broad' as TGroupName, () => {
    for (let i = 0; i < 1000; i++) test('t', () => {});
  });
});

const suiteNameCollision = create(() => {
  for (let i = 0; i < 1000; i++) test('common_name' as TFieldName, () => {});
});

const largeName = 'a'.repeat(1000);
const suiteLargeName = create(() => {
  for (let i = 0; i < 100; i++) test(largeName as TFieldName, () => {});
});

const suiteLargeMsg = create(() => {
  for (let i = 0; i < 100; i++)
    test('t', () => {
      enforce(1).message(largeName).equals(2);
    });
});

describe('Edge Cases & Integration', () => {
  bench('Deep Group Nesting', () => {
    suiteDeepNest.run();
  });
  bench('Broad Group', () => {
    suiteBroadGroup.run();
  });
  bench('Namespace Collision', () => {
    suiteNameCollision.run();
  });
  bench('Large Field Names', () => {
    suiteLargeName.run();
  });
  bench('Large Failure Messages', () => {
    suiteLargeMsg.run();
  });

  // Integration
  bench('Classnames', () => {
    // classnames usually provided by library
  });
  bench('Static Suite', () => {
    // create + runStatic
    const s = create(() => {});
    s.runStatic();
  });
  bench('Topic-based', () => {
    create(() => {
      group('topic', () => {
        test('t', () => {});
      });
    }).run();
  });
  bench('Mixed Mode', () => {
    create(() => {
      mode(Modes.ALL);
      test('sync', () => {});
      test('async', async () => {});
    }).run();
  });
});
