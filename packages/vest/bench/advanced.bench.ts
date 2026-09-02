// @ts-nocheck
import { bench, describe } from 'vitest';
import {
  create,
  test,
  enforce,
  group,
  warn,
  each,
  skipWhen,
  omitWhen,
  include,
  mode,
  Modes,
} from '../src/vest';

import { SuiteSerializer } from '../src/exports/SuiteSerializer';
import { TFieldName, TGroupName } from '../src/suiteResult/SuiteResultTypes';

// --- Advanced Control Flow & Combinations ---

const suiteGroupEach = create(() => {
  group('g1' as TGroupName, () => {
    // @ts-ignore
    each([1, 2], num => {
      test('t1', () => {
        enforce(num).isNumber();
      });
    });
  });
});

const suiteEachGroup = create(() => {
  // @ts-ignore
  each([1, 2], (num: number) => {
    group(`g_${num}` as TGroupName, () => {
      test('t1', () => {
        enforce(num).isNumber();
      });
    });
  });
});

const suiteSkipWhenGroup = create(() => {
  skipWhen(true, () => {
    group('skipped' as TGroupName, () => {
      test('t1', () => {});
    });
  });
});

const suiteOmitWhenGroup = create(() => {
  omitWhen(true, () => {
    group('omitted' as TGroupName, () => {
      test('t1', () => {});
    });
  });
});

const suiteSkipWhenEach = create(() => {
  skipWhen(true, () => {
    // @ts-ignore
    each([1, 2, 3], () => {
      test('skipped_each_item', () => {});
    });
  });
});

const suiteOmitWhenEach = create(() => {
  omitWhen(true, () => {
    // @ts-ignore
    each([1, 2, 3], () => {
      test('omitted_each_item', () => {});
    });
  });
});

const suiteGroupMixed = create(() => {
  group('mixed' as TGroupName, () => {
    test('sync', () => {});
    test('async', async () => {});
  });
});

const suiteGroupAsyncOnly = create(() => {
  group('async_only' as TGroupName, () => {
    test('a1', async () => {});
    test('a2', async () => {});
  });
});

// --- Complex Data Validation ---

const flatObj = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 10 };
const suiteEnforceShapeFlat = create(() => {
  test('flatStruct', () => {
    enforce(flatObj).shape({
      a: enforce.isNumber(),
      j: enforce.isNumber(),
    });
  });
});

const nestedObj = { l1: { l2: { l3: { l4: { l5: 'val' } } } } };
const suiteEnforceShapeNested = create(() => {
  test('nestedStruct', () => {
    enforce(nestedObj).shape({
      l1: enforce.shape({
        l2: enforce.shape({
          l3: enforce.shape({
            l4: enforce.shape({
              l5: enforce.isString(),
            }),
          }),
        }),
      }),
    });
  });
});

const arrPrim = Array.from({ length: 100 }, (_, i) => i);
const suiteIsArrayOfPrim = create(() => {
  test('arrPrim', () => {
    enforce.isArrayOf(enforce.isNumber()).test(arrPrim);
  });
});

const arrShape = Array.from({ length: 50 }, (_, i) => ({ id: i }));
const suiteIsArrayOfShape = create(() => {
  test('arrShape', () => {
    enforce.isArrayOf(enforce.shape({ id: enforce.isNumber() })).test(arrShape);
  });
});

const suiteLooseShape = create(() => {
  enforce({ a: 1, b: 2 }).loose({ a: enforce.isNumber() });
});

// Composition skipped for now as APIs vary, focusing on built-ins

// Huge string
const hugeStr = 'a'.repeat(1024 * 1024); // 1MB
const suiteHugeString = create(() => {
  test('huge_str', () => {
    enforce(hugeStr).longerThan(10).shorterThan(2000000);
  });
});

const bigArr = Array.from({ length: 10000 }, (_, i) => i);
const suiteHugeArray = create(() => {
  test('huge_arr', () => {
    enforce(bigArr).isArray().longerThan(10);
  });
});

// --- State Management ---

// Serialization
const suiteSerializeSmall = create(() => {
  test('t1', () => {});
});
const smallRes = suiteSerializeSmall.run();

const suiteSerializeLarge = create(() => {
  for (let i = 0; i < 500; i++) test(`f${i}` as TFieldName, () => {});
});
const largeRes = suiteSerializeLarge.run();
const serializedSmall = SuiteSerializer.serialize(smallRes);

const suiteResume = create(() => {
  test('t1', () => {});
});

const suiteReset = create(() => {
  test('t1', () => {});
});

const suiteRemove = create(() => {
  test('t1', () => {});
  test('t2', () => {});
});

// --- Result Selectors ---

const suiteSelectorsGroup = create(() => {
  group('g1' as TGroupName, () => {
    test('f1', () => {
      enforce(1).equals(2);
    }); // fail
  });
});
const resGroup = suiteSelectorsGroup.run();

const suiteSelectorsNested = create(() => {
  group('l1' as TGroupName, () => {
    group('l2' as TGroupName, () => {
      test('f1', () => {
        enforce(1).equals(2);
      });
    });
  });
});
const resNested = suiteSelectorsNested.run();

const suiteSelectorsWarnings = create(() => {
  test('w1', () => {
    warn();
    enforce(1).equals(2);
  });
});
const resWarn = suiteSelectorsWarnings.run();

// --- Async & Concurrency ---

const suiteAsyncWaterfall = create(() => {
  test('t1', async () => {});
  test('t2', async () => {}); // Parallel in Vest usually, logic mainly tests overhead
});

// --- Hooks ---

const suiteIncludePass = create(() => {
  include('f1' as TFieldName).when(() => true);
  test('f1', () => {});
});

const suiteIncludeFail = create(() => {
  include('f1' as TFieldName).when(() => false);
  test('f1', () => {});
});

const suiteEagerGroup = create(() => {
  mode(Modes.EAGER);
  group('g1' as TGroupName, () => {
    test('f1', () => {
      enforce(1).equals(2);
    });
    test('f2', () => {});
  });
});

// --- Integration ---

const suiteDeepNesting = create(() => {
  // 50 levels
  const nest = (depth: number) => {
    if (depth === 0) return test('leaf', () => {});
    group(`depth_${depth}` as TGroupName, () => nest(depth - 1));
  };
  nest(50);
});

const suiteEmpty = create(() => {});

const suiteCallbacks = create(() => {
  for (let i = 0; i < 1000; i++) test(`t${i}` as TFieldName, () => {});
});

// --- Execution ---

describe('Advanced Control Flow', () => {
  bench('Group + Each', () => {
    suiteGroupEach.run();
  });
  bench('Each + Group', () => {
    suiteEachGroup.run();
  });
  bench('SkipWhen + Group', () => {
    suiteSkipWhenGroup.run();
  });
  bench('OmitWhen + Group', () => {
    suiteOmitWhenGroup.run();
  });
  bench('SkipWhen + Each', () => {
    suiteSkipWhenEach.run();
  });
  bench('OmitWhen + Each', () => {
    suiteOmitWhenEach.run();
  });
  bench('Group Mixed Sync/Async', () => {
    suiteGroupMixed.run();
  });
  bench('Group Async Only', () => {
    suiteGroupAsyncOnly.run();
  });
});

describe('Complex Data Validation', () => {
  bench('Enforce Shape Flat', () => {
    suiteEnforceShapeFlat.run();
  });
  bench('Enforce Shape Nested', () => {
    suiteEnforceShapeNested.run();
  });
  bench('Enforce IsArrayOf Primitive', () => {
    suiteIsArrayOfPrim.run();
  });
  bench('Enforce IsArrayOf Shape', () => {
    suiteIsArrayOfShape.run();
  });
  bench('Enforce Loose', () => {
    suiteLooseShape.run();
  });
  bench('Enforce Huge String', () => {
    suiteHugeString.run();
  });
  bench('Enforce Huge Array', () => {
    suiteHugeArray.run();
  });
});

describe('State Management', () => {
  bench('Serialize Small', () => {
    SuiteSerializer.serialize(smallRes);
  });
  bench('Serialize Large', () => {
    SuiteSerializer.serialize(largeRes);
  });
  bench('Resume Suite', () => {
    SuiteSerializer.resume(suiteResume, serializedSmall);
    suiteResume.run();
  });
  bench('Suite Reset', () => {
    suiteReset.run();
    suiteReset.reset();
  });
  bench('Suite Remove', () => {
    suiteRemove.reset();
    suiteRemove.run();
    suiteRemove.remove('t1');
  });
});

describe('Result Selectors', () => {
  bench('getErrors Group', () => {
    resGroup.getErrorsByGroup('g1');
  });
  bench('getErrors Nested', () => {
    resNested.getErrorsByGroup('l1');
  }); // Approximate
  bench('hasErrors Group', () => {
    resGroup.hasErrorsByGroup('g1');
  });
  bench('getWarnings Global', () => {
    resWarn.getWarnings();
  });
  bench('isValid Group', () => {
    resGroup.isValidByGroup('g1');
  });
  bench('Selector Thrashing', () => {
    for (let i = 0; i < 50; i++) {
      resGroup.hasErrors();
      resGroup.isValid();
    }
  });
});

describe('Async & Concurrency', () => {
  bench('Waterfall Async', () => {
    suiteAsyncWaterfall.run();
  });
  // Race condition difficult to simulate deterministically in bench, skipping
});

describe('Hooks & Modes', () => {
  bench('Include When (Pass)', () => {
    suiteIncludePass.run();
  });
  bench('Include When (Fail)', () => {
    suiteIncludeFail.run();
  });
  bench('Mode Eager Group', () => {
    suiteEagerGroup.run();
  });
});

describe('Integration & Edge Cases', () => {
  // bench('Classnames Helper', () => { suiteClassnames.run(); }); // Not strictly a suite run, checking logic
  bench('Deep Nesting (50)', () => {
    suiteDeepNesting.run();
  });
  bench('Empty Suite', () => {
    suiteEmpty.run();
  });
  bench('Callback Overhead', () => {
    suiteCallbacks.run();
  });
});
