import { bench, describe } from 'vitest';
import { create, test, enforce } from '../../src/vest';

// --- State & Selectors ---

const suiteSelectors = create(() => {
  test('f1', () => {});
  test('f2', () => {
    enforce(1).equals(2);
  });
});

describe('State & Selectors', () => {
  suiteSelectors.run(); // Ensure state exists
  const res = suiteSelectors.get();

  bench('suite.get() (Immediate)', () => {
    suiteSelectors.get();
  });
  bench('isValid() (Field)', () => {
    res.isValid('f1');
  });
  bench('hasErrors() (Global)', () => {
    res.hasErrors();
  });
  bench('getErrors() (By Field)', () => {
    res.getErrors('f2');
  });
  bench('suite.reset()', () => {
    suiteSelectors.reset();
  });
});
