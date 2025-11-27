import { describe, it, expect } from 'vitest';

import { gatherFailures } from '../suiteResult/selectors/collectFailures';
import { suiteSelectors } from '../suiteResult/selectors/suiteSelectors';

describe('Refactor Regression Tests', () => {
  describe('collectFailures.ts consumers', () => {
    it('gatherFailures should return specific field failures when fieldName is provided', () => {
      const group = {
        fieldA: { errorCount: 1, errors: ['err1'] },
        fieldB: { errorCount: 0, errors: [] },
      };
      // @ts-ignore
      const result = gatherFailures(group, 'errors', 'fieldA');
      expect(result).toEqual(['err1']);
    });

    it('gatherFailures should return all failures when fieldName is omitted', () => {
      const group = {
        fieldA: { errorCount: 1, errors: ['err1'] },
        fieldB: { errorCount: 1, errors: ['err2'] },
      };
      // @ts-ignore
      const result = gatherFailures(group, 'errors');
      expect(result).toEqual({ fieldA: ['err1'], fieldB: ['err2'] });
    });
  });

  describe('suiteSelectors.ts consumers', () => {
    const summary = {
      valid: false,
      errorCount: 1,
      warnCount: 0,
      testCount: 1,
      errors: [{ fieldName: 'f1', message: 'e1' }],
      warnings: [],
      groups: {
        g1: {
          f1: { errorCount: 1, errors: ['e1'] },
        },
      },
      tests: {
        f1: { errorCount: 1, errors: ['e1'], pendingCount: 0, testCount: 1 },
      },
    };

    // @ts-ignore
    const selectors = suiteSelectors(summary);

    it('should correctly retrieve error existence via hasErrors', () => {
      expect(selectors.hasErrors('f1')).toBe(true);
      expect(selectors.hasErrors('f2')).toBe(false);
    });

    it('should correctly retrieve errors via getErrors', () => {
      expect(selectors.getErrors('f1')).toEqual(['e1']);
    });

    it('should correctly retrieve failures by group via hasErrorsByGroup', () => {
      expect(selectors.hasErrorsByGroup('g1')).toBe(true);
      // @ts-expect-error - Testing invalid group
      expect(selectors.hasErrorsByGroup('g2')).toBe(false);
    });
  });
});
