import { bench, describe } from 'vitest';
import { create, test, enforce, each, warn, optional, skip } from '../src/vest';
import classnames from '../src/exports/classnames';
import { TFieldName } from '../src/suiteResult/SuiteResultTypes';

// --- Reordering & Reconciliation ---

const reorderSuite = create((items: any[]) => {
  // @ts-ignore
  each(items, item => {
    test(item.id, () => {
      enforce(item.val).isNumeric();
    });
  });
});

const list100 = Array.from({ length: 100 }, (_, i) => ({
  id: String(i),
  val: i,
}));
const list100Reverse = [...list100].reverse();
const list100InsertMiddle = [
  ...list100.slice(0, 50),
  { id: 'new', val: 999 },
  ...list100.slice(50),
];
const list100DeleteMiddle = [...list100.slice(0, 49), ...list100.slice(50)]; // delete index 49

const suiteKeyThrash = create(() => {
  // @ts-ignore
  each(Array.from({ length: 100 }), () => {
    test(String(Math.random()), () => {});
  });
});

// Init history
reorderSuite.run(list100);

describe('Reordering & Reconciliation', () => {
  bench('each (Reorder - Reverse)', () => {
    reorderSuite.run(list100Reverse);
    reorderSuite.run(list100); // Toggle back
  });

  bench('each (Reorder - Insert Middle)', () => {
    reorderSuite.run(list100InsertMiddle);
    reorderSuite.run(list100);
  });

  bench('each (Reorder - Delete Middle)', () => {
    reorderSuite.run(list100DeleteMiddle);
    reorderSuite.run(list100);
  });

  bench('each (Key Thrashing)', () => {
    suiteKeyThrash.run();
  });
});

// --- State Mutation & Reset ---

const suiteResetField = create(() => {
  test('f1', () => {});
});
suiteResetField.run();

const suiteRemoveMany = create(() => {
  for (let i = 0; i < 100; i++) test(`${i}` as TFieldName, () => {});
});
suiteRemoveMany.run();

const suiteResetHuge = create(() => {
  for (let i = 0; i < 1000; i++) test(`${i}` as TFieldName, () => {});
});
suiteResetHuge.run();

describe('State Mutation & Reset', () => {
  bench('suite.resetField()', () => {
    suiteResetField.resetField('f1');
    suiteResetField.run(); // Re-populate
  });

  bench('suite.remove() (Many Fields)', () => {
    suiteRemoveMany.run(); // Ensure populated
    for (let i = 0; i < 100; i++) suiteRemoveMany.remove(`${i}`);
  });

  bench('suite.reset() (Memory Reclamation)', () => {
    suiteResetHuge.run();
    suiteResetHuge.reset();
  });
});

// --- Utilities & Exports ---

const resObj = suiteResetField.run();

const complexClassnames = {
  c1: true,
  c2: () => true,
  c3: false,
};

describe('Utilities & Exports', () => {
  bench('classnames (Complex Mapping)', () => {
    // @ts-ignore
    classnames(resObj, complexClassnames);
  });
});

// --- Validation Message Handling ---

const suiteMsgString = create(() => {
  test('f', 'msg', () => false);
});

const suiteMsgFn = create(() => {
  test('f', 'msg', () => false);
});

const suiteDynamicMsg = create(() => {
  test(
    'f',
    // @ts-ignore
    Math.random().toString(),
    () => false,
  );
});

describe('Validation Message Handling', () => {
  bench('Message Function vs String', () => {
    suiteMsgString.run();
    suiteMsgFn.run();
  });

  bench('Dynamic Message Generation', () => {
    suiteDynamicMsg.run();
  });
});

// --- Schema & Advanced Enforce ---

const numeric = (v: any) => enforce(v).isNumeric();
const notNumeric = (v: any) => !numeric(v);

describe('Schema & Advanced Enforce', () => {
  bench('enforce with bindNot (High Freq)', () => {
    for (let i = 0; i < 1000; i++) {
      notNumeric('a');
    }
  });

  // enforce context context - strictly depends on custom rules using context. Skipping complexity for now.
});

// --- Hooks & Edge Conditions ---

const suiteWarnOptional = create(() => {
  optional('f');
  test('f', () => {
    warn();
    enforce(1).equals(2);
  });
});

const suiteStatic = create(() => {
  enforce(1).equals(1);
});
suiteStatic.runStatic(); // Init

const suiteSkipContext = create(shouldSkip => {
  if (shouldSkip) {
    skip('f');
  }
  test('f', () => {});
});

describe('Hooks & Edge Conditions', () => {
  bench('warn + optional intersection', () => {
    suiteWarnOptional.run();
  });

  // bench('staticSuite (runStatic Re-run)', () => {
  //   suiteStatic.runStatic();
  // });

  bench('skip via Context', () => {
    suiteSkipContext.run(true);
    suiteSkipContext.run(false);
  });
});

// --- Concurrency & Events ---

const suiteBusStress = create(() => {
  for (let i = 0; i < 1000; i++) test('t', () => {});
});

describe('Concurrency & Events', () => {
  bench('Bus Stress', () => {
    suiteBusStress.run();
  });

  // Subscriber thrashing requires public subscribe API or internal bus access
});

// --- Deep Internals ---
