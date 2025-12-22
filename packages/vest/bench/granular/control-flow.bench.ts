import { bench, describe } from 'vitest';
import { create, test, enforce, group, skip, only, each } from '../../src/vest';
import { TFieldName, TGroupName } from '../../src/suiteResult/SuiteResultTypes';

// --- Control Flow & Isolation ---

const suiteGroupEmpty = create(() => {
  group('empty_group' as TGroupName, () => {});
});

const suiteGroupSync = create(() => {
  group('sync_group' as TGroupName, () => {
    test('t1', () => {});
    test('t2', () => {});
  });
});

const suiteGroupAsync = create(() => {
  group('async_group' as TGroupName, () => {
    test('t1', async () => {});
  });
});

const suiteGroupNested = create(() => {
  group('l1' as TGroupName, () => {
    group('l2' as TGroupName, () => {
      group('l3' as TGroupName, () => {
        group('l4' as TGroupName, () => {
          group('l5' as TGroupName, () => {
            test('deep', () => {});
          });
        });
      });
    });
  });
});

const suiteEachPrimitive = create(() => {
  // @ts-ignore
  each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], (num: any) => {
    test('each_test' as TFieldName, () => {
      enforce(num).greaterThan(0);
    });
  });
});

const suiteEachObject = create(() => {
  // @ts-ignore
  each([{ id: 1 }, { id: 2 }, { id: 3 }], (obj: any) => {
    test('each_obj' as TFieldName, () => {
      enforce(obj.id).greaterThan(0);
    });
  });
});

const suiteSkipSingle = create(() => {
  skip('skipped_field' as TFieldName);
  test('skipped_field' as TFieldName, () => {});
});

const suiteOnlySingle = create(() => {
  only('only_field' as TFieldName);
  test('only_field' as TFieldName, () => {});
  test('other_field' as TFieldName, () => {});
});

const suiteSkipGroup = create(() => {
  group('skipped_group' as TGroupName, () => {
    skip(true);
    test('t1', () => {});
  });
});

const suiteOnlyGroup = create(() => {
  group('only_group' as TGroupName, () => {
    only('only_group' as TFieldName);
    test('t1', () => {});
  });
  group('other_group' as TGroupName, () => {
    test('t2', () => {});
  });
});

describe('Control Flow & Isolation', () => {
  bench('group (Empty)', () => {
    suiteGroupEmpty.run();
  });
  bench('group (With Sync Tests)', () => {
    suiteGroupSync.run();
  });
  bench('group (With Async Tests)', () => {
    suiteGroupAsync.run();
  });
  bench('group (Nested Depth)', () => {
    suiteGroupNested.run();
  });
  bench('each (Primitive Array)', () => {
    suiteEachPrimitive.run();
  });
  bench('each (Object Array)', () => {
    suiteEachObject.run();
  });
  bench('skip (Single Test)', () => {
    suiteSkipSingle.run();
  });
  bench('only (Single Test)', () => {
    suiteOnlySingle.run();
  });
  bench('skip() in group', () => {
    suiteSkipGroup.run();
  });
  bench('only() in group', () => {
    suiteOnlyGroup.run();
  });
});
