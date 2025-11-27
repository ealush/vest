import { bench, describe } from 'vitest';

import {
  create,
  each,
  enforce,
  group,
  include,
  mode,
  Modes,
  omitWhen,
  only,
  optional,
  skip,
  skipWhen,
  test,
  warn,
} from '../src/vest';

type ComplexInput = {
  value: number;
  onlyField?: string;
  skipField?: string;
  toggle: boolean;
  omit?: boolean;
  items: number[];
};

const complexSuite = create((input: ComplexInput) => {
  mode(Modes.ALL);
  only(input.onlyField);
  skip(input.skipField);
  optional('optional_field');
  include('conditional_field').when(() => input.toggle);

  group('main', () => {
    test('field_primary', () => {
      enforce(input.value).greaterThan(0);
    });

    test('field_warning', () => {
      warn();
      enforce(input.value).greaterThan(5);
    });

    test('optional_field', () => {
      enforce(input.value).isNumber();
    });
  });

  test('skipped_field', () => {
    enforce(input.value).isNumber();
  });

  skipWhen(!input.toggle, () => {
    test('conditional_field', () => {
      enforce(input.value).lessThan(1000);
    });
  });

  omitWhen(input.omit, () => {
    test('omittable_field', () => {
      enforce(input.value).notEquals(0);
    });
  });

  each(input.items, (value, index) => {
    test(
      `list_item_${index}`,
      () => {
        enforce(value).isNumber();
      },
      index,
    );
  });
});

const baseData: ComplexInput = {
  value: 42,
  toggle: true,
  items: [1, 2, 3, 4, 5],
};

const focusedData: ComplexInput = {
  items: [5, 6, 7],
  omit: true,
  onlyField: 'field_primary',
  skipField: 'skipped_field',
  toggle: false,
  value: 10,
};

describe('Complex Feature Mix', () => {
  bench(
    'full run with feature flags',
    () => {
      for (let i = 0; i < 10; i++) {
        complexSuite.run(baseData);
      }
    },
    { time: 1000 },
  );

  bench(
    'focused/conditional run',
    () => {
      for (let i = 0; i < 10; i++) {
        complexSuite.run(focusedData);
      }
    },
    { time: 1000 },
  );
});
