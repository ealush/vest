import { bench, describe } from 'vitest';

import { TFieldName, TGroupName } from '../src/suiteResult/SuiteResultTypes';
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
  group('profile' as TGroupName, () => {
    test('email' as TFieldName, () => {
      enforce(input.validEmail).matches(/@/).endsWith('.com');
    });

    test('zip' as TFieldName, () => {
      enforce(input.zip).isString().longerThan(3).shorterThan(10);
    });
  });

  group('details' as TGroupName, () => {
    optional('age' as TFieldName);

    test('age' as TFieldName, () => {
      enforce(input.age).isNumber().greaterThan(17).lessThan(120);
    });

    skipWhen(!input.hasWarnings, () => {
      test('warning_field' as TFieldName, () => {
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
  result.getError('email' as TFieldName);
  result.getWarning('warning_field' as TFieldName);
  result.getMessage('zip' as TFieldName);
  result.getErrorsByGroup('profile' as TGroupName);
  result.getWarningsByGroup('details' as TGroupName);
  result.hasErrorsByGroup('profile' as TGroupName);
  result.hasWarningsByGroup('details' as TGroupName);
  result.isValid();
  result.isValid('email' as TFieldName);
  result.isValidByGroup('profile' as TGroupName);
  result.isValidByGroup('details' as TGroupName, 'age' as TFieldName);
  result.isPending();
  result.isTested('email' as TFieldName);
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
