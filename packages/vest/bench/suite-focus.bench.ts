import { bench, describe } from 'vitest';

import { create, enforce, group, test } from '../src/vest';

const focusSuite = create(() => {
  group('groupA', () => {
    test('field_1', () => {
      enforce(1).equals(1);
    });
    test('field_2', () => {
      enforce(2).greaterThan(1);
    });
  });

  group('groupB', () => {
    test('field_3', () => {
      enforce(3).lessThan(5);
    });
    test('field_4', () => {
      enforce(4).equals(4);
    });
  });

  test('field_5', () => {
    enforce(5).equals(5);
  });
});

describe('suite.focus modifiers', () => {
  bench(
    'no focus modifiers',
    () => {
      focusSuite.run();
    },
    { time: 150, iterations: 15 },
  );

  bench(
    'skipGroup: skip one group',
    () => {
      focusSuite.focus({ skipGroup: 'groupA' }).run();
    },
    { time: 150, iterations: 15 },
  );

  bench(
    'onlyGroup: limit to one group',
    () => {
      focusSuite.focus({ onlyGroup: 'groupB' }).run();
    },
    { time: 150, iterations: 15 },
  );

  bench(
    'only: single field across groups',
    () => {
      focusSuite.focus({ only: 'field_1' }).run();
    },
    { time: 150, iterations: 15 },
  );

  bench(
    'skip: single field',
    () => {
      focusSuite.focus({ skip: 'field_1' }).run();
    },
    { time: 150, iterations: 15 },
  );

  bench(
    'combined focus: onlyGroup and only field',
    () => {
      focusSuite.focus({ onlyGroup: 'groupB', only: 'field_3' }).run();
    },
    { time: 150, iterations: 15 },
  );

  bench(
    'combined focus: skipGroup and skip field',
    () => {
      focusSuite.focus({ skipGroup: 'groupA', skip: 'field_4' }).run();
    },
    { time: 150, iterations: 15 },
  );
});
