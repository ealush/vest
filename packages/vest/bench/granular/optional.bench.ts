import { bench, describe } from 'vitest';
import { create, test, enforce, optional, mode, Modes } from '../../src/vest';
import { TFieldName } from '../../src/suiteResult/SuiteResultTypes';

// --- Optional & Validity Modes ---

const suiteOptionalMissing = create(() => {
  optional('missing' as TFieldName);
});

const suiteOptionalValid = create(() => {
  optional('present' as TFieldName);
  test('present' as TFieldName, () => {});
});

const suiteOptionalInvalid = create(() => {
  optional('failing' as TFieldName);
  test('failing' as TFieldName, () => {
    enforce(1).equals(2);
  });
});

const suiteModeEager = create(() => {
  mode(Modes.EAGER);
  test('f1', () => {
    enforce(1).equals(2);
  });
  test('f2', () => {});
});

const suiteModeAll = create(() => {
  mode(Modes.ALL);
  test('f1', () => {
    enforce(1).equals(2);
  });
  test('f2', () => {});
});

describe('Optional & Validity Modes', () => {
  bench('optional (Field Missing)', () => {
    suiteOptionalMissing.run();
  });
  bench('optional (Field Present & Valid)', () => {
    suiteOptionalValid.run();
  });
  bench('optional (Field Present & Invalid)', () => {
    suiteOptionalInvalid.run();
  });
  bench('mode (Eager)', () => {
    suiteModeEager.run();
  });
  bench('mode (All)', () => {
    suiteModeAll.run();
  });
});
