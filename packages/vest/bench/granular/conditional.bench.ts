import { bench, describe } from 'vitest';
import { create, test, skipWhen, omitWhen, include } from '../../src/vest';
import { TFieldName } from '../../src/suiteResult/SuiteResultTypes';

// --- Conditional Execution ---

const suiteSkipWhenTrue = create(() => {
  skipWhen(true, () => {
    test('skipped', () => {});
  });
});

const suiteSkipWhenFalse = create(() => {
  skipWhen(false, () => {
    test('ran', () => {});
  });
});

const suiteOmitWhenTrue = create(() => {
  omitWhen(true, () => {
    test('omitted', () => {});
  });
});

const suiteOmitWhenFalse = create(() => {
  omitWhen(false, () => {
    test('included', () => {});
  });
});

const suiteInclude = create(() => {
  include('fieldA' as TFieldName).when('fieldB' as TFieldName);
  test('fieldA' as TFieldName, () => {});
});

describe('Conditional Execution', () => {
  bench('skipWhen (Condition True)', () => {
    suiteSkipWhenTrue.run();
  });
  bench('skipWhen (Condition False)', () => {
    suiteSkipWhenFalse.run();
  });
  bench('omitWhen (Condition True)', () => {
    suiteOmitWhenTrue.run();
  });
  bench('omitWhen (Condition False)', () => {
    suiteOmitWhenFalse.run();
  });
  bench('include (Linked Fields)', () => {
    suiteInclude.run();
  });
});
