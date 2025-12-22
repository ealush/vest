import { bench, describe } from 'vitest';
import { create, enforce } from '../../src/vest';

// --- Enforce & Validation Logic ---

const suiteEnforceSimple = create(() => {
  enforce(1).isNumber();
});

const suiteEnforceChain = create(() => {
  enforce(10).isNumber().greaterThan(0).lessThan(20).equals(10).matches(/10/);
});

const suiteEnforceTemplate = create(() => {
  enforce(1).greaterThan(0);
});

describe('Enforce & Validation Logic', () => {
  bench('enforce (Simple Chain)', () => {
    suiteEnforceSimple.run();
  });
  bench('enforce (Long Chain)', () => {
    suiteEnforceChain.run();
  });
  bench('enforce (template string)', () => {
    suiteEnforceTemplate.run();
  });
});
