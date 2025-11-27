import { bench, describe } from 'vitest';

import { TFieldName } from '../src/suiteResult/SuiteResultTypes';
import { create, enforce, include, only, skip, test } from '../src/vest';

type FocusData = {
  focusField?: string;
  skipField?: string;
  includeField?: string;
};

const focusSuite = create((data: FocusData) => {
  only(data.focusField as TFieldName);
  skip(data.skipField as TFieldName);
  include((data.includeField ?? 'field_c') as TFieldName).when(() => true);

  test('field_a' as TFieldName, () => {
    enforce(1).equals(1);
  });

  test('field_b' as TFieldName, () => {
    enforce(2).greaterThan(1);
  });

  test('field_c' as TFieldName, () => {
    enforce(3).lessThan(5);
  });
});

describe('Focus and filters', () => {
  bench(
    'only one field',
    () => {
      focusSuite.run({ focusField: 'field_b' });
    },
    { time: 150, iterations: 15 },
  );

  bench(
    'skip one field',
    () => {
      focusSuite.run({ skipField: 'field_a' });
    },
    { time: 150, iterations: 15 },
  );

  bench(
    'include linked field',
    () => {
      focusSuite.run({ includeField: 'field_c' });
    },
    { time: 150, iterations: 15 },
  );
});
