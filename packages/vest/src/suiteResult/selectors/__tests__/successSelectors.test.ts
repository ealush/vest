import { describe, expect, it } from 'vitest';

import { Modes, create, enforce, mode, success, test } from '../../../vest';

describe('Success Selectors', () => {
  describe('success message visibility', () => {
    it('should surface the message when a success test passes', () => {
      const suite = create(() => {
        test('password', 'Strong password!', () => {
          success();
          enforce('Abc123').matches(/[A-Z].*\d/);
        });
      });

      const res = suite.run();
      expect(res.hasSuccesses('password')).toBe(true);
      expect(res.getSuccesses('password')).toEqual(['Strong password!']);
    });

    it('should NOT surface the message when a success test fails', () => {
      const suite = create(() => {
        test('password', 'Strong password!', () => {
          success();
          enforce('weak').matches(/[A-Z].*\d/);
        });
      });

      const res = suite.run();
      expect(res.hasSuccesses('password')).toBe(false);
      expect(res.getSuccesses('password')).toEqual([]);
    });

    it('should NOT surface any message for a passing test without success()', () => {
      const suite = create(() => {
        test('password', 'some message', () => {
          enforce('abc').isNotBlank();
        });
      });

      const res = suite.run();
      expect(res.hasSuccesses('password')).toBe(false);
      expect(res.getSuccesses('password')).toEqual([]);
    });
  });

  describe('per-test granularity', () => {
    it('should show success for a passing test even when other tests on the same field fail', () => {
      const suite = create(() => {
        mode(Modes.ALL);
        test('password', 'Too short', () => {
          enforce('Ab1').longerThan(8);
        });
        test('password', 'Contains a number', () => {
          success();
          enforce('Ab1').matches(/\d/);
        });
      });

      const res = suite.run();
      expect(res.hasErrors('password')).toBe(true);
      expect(res.hasSuccesses('password')).toBe(true);
      expect(res.getErrors('password')).toEqual(['Too short']);
      expect(res.getSuccesses('password')).toEqual(['Contains a number']);
    });

    it('should collect multiple success messages from separate passing tests', () => {
      const suite = create(() => {
        test('password', 'Has uppercase', () => {
          success();
          enforce('Abc123!').matches(/[A-Z]/);
        });
        test('password', 'Has number', () => {
          success();
          enforce('Abc123!').matches(/\d/);
        });
        test('password', 'Has special char', () => {
          success();
          enforce('Abc123!').matches(/[!@#$%]/);
        });
      });

      const res = suite.run();
      expect(res.getSuccesses('password')).toEqual([
        'Has uppercase',
        'Has number',
        'Has special char',
      ]);
    });

    it('should only collect success messages from passing tests, not failing ones', () => {
      const suite = create(() => {
        test('password', 'Has uppercase', () => {
          success();
          enforce('abc123').matches(/[A-Z]/); // fails
        });
        test('password', 'Has number', () => {
          success();
          enforce('abc123').matches(/\d/); // passes
        });
      });

      const res = suite.run();
      expect(res.getSuccesses('password')).toEqual(['Has number']);
    });
  });

  describe('success does not affect validity', () => {
    it('should not make an otherwise invalid field valid', () => {
      const suite = create(() => {
        mode(Modes.ALL);
        test('field', 'error message', () => false);
        test('field', 'success message', () => {
          success();
        });
      });

      const res = suite.run();
      expect(res.isValid('field')).toBe(false);
      expect(res.hasSuccesses('field')).toBe(true);
    });

    it('a suite with only success tests should be valid', () => {
      const suite = create(() => {
        test('field', 'all good', () => {
          success();
        });
      });

      const res = suite.run();
      expect(res.isValid()).toBe(true);
    });
  });
});
