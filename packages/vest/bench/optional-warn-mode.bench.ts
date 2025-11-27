import { bench, describe } from 'vitest';

import { TFieldName } from '../src/suiteResult/SuiteResultTypes';
import {
  Modes,
  create,
  enforce,
  mode,
  optional,
  test,
  warn,
} from '../src/vest';

type ModeData = {
  value: number;
  useAll: boolean;
};

const modeSuite = create((data: ModeData) => {
  mode(data.useAll ? Modes.ALL : Modes.EAGER);
  optional('optional_field' as TFieldName);

  test('required' as TFieldName, () => {
    enforce(data.value).greaterThan(0);
  });

  test('optional_field' as TFieldName, () => {
    enforce(data.value).lessThan(10_000);
  });

  test('warn_field' as TFieldName, () => {
    warn();
    enforce(data.value).greaterThan(5);
  });
});

describe('Optional, warn, and modes', () => {
  bench(
    'eager mode',
    () => {
      modeSuite.run({ value: 42, useAll: false });
    },
    { time: 120, iterations: 12 },
  );

  bench(
    'all mode',
    () => {
      modeSuite.run({ value: 7, useAll: true });
    },
    { time: 120, iterations: 12 },
  );
});
