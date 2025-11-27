import { bench, describe } from 'vitest';

import {
  create,
  enforce,
  group,
  optional,
  skipWhen,
  test,
  warn,
} from '../src/vest';

type SelectorInput = {
  validEmail: string;
  zip: string;
  age: number;
  hasWarnings: boolean;
};

const selectorsSuite = create((input: SelectorInput) => {
  group('profile', () => {
    test('email', () => {
      enforce(input.validEmail).matches(/@/).endsWith('.com');
    });

    test('zip', () => {
      enforce(input.zip).isString().longerThan(3).shorterThan(10);
    });
  });

  group('details', () => {
    optional('age');

    test('age', () => {
      enforce(input.age).isNumber().greaterThan(17).lessThan(120);
    });

    skipWhen(!input.hasWarnings, () => {
      test('warning_field', () => {
        warn();
        enforce(input.age).greaterThan(30);
      });
    });
  });
});

const errorData: SelectorInput = {
  age: 15,
  hasWarnings: true,
  validEmail: 'user_at_example.com',
  zip: '12',
};

const cleanData: SelectorInput = {
  age: 42,
  hasWarnings: false,
  validEmail: 'user@example.com',
  zip: '90210',
};

function touchSelectors(result: ReturnType<typeof selectorsSuite.run>): void {
  result.hasErrors();
  result.hasWarnings();
  result.getErrors();
  result.getWarnings();
  result.getError('email');
  result.getWarning('warning_field');
  result.getMessage('zip');
  result.getErrorsByGroup('profile');
  result.getWarningsByGroup('details');
  result.hasErrorsByGroup('profile');
  result.hasWarningsByGroup('details');
  result.isValid();
  result.isValid('email' as any);
  result.isValidByGroup('profile');
  result.isValidByGroup('details', 'age' as any);
  result.isPending();
  result.isTested('email' as any);
}

describe('Suite selectors coverage', () => {
  bench(
    'selectors with failures and warnings',
    () => {
      const result = selectorsSuite.run(errorData);
      touchSelectors(result);
    },
    { time: 200 },
  );

  bench(
    'selectors with clean data',
    () => {
      const result = selectorsSuite.run(cleanData);
      touchSelectors(result);
    },
    { time: 200 },
  );
});
