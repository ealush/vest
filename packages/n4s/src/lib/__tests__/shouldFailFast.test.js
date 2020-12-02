import EnforceContext from 'EnforceContext';
import RuleResult from 'RuleResult';
import shouldFailFast from 'shouldFailFast';

describe('shouldFailFast', () => {
  describe('When failFast is false', () => {
    it('Should return false regardless of rule result', () => {
      const ctx = new EnforceContext(null).setFailFast(false);
      expect(shouldFailFast(ctx, new RuleResult(true))).toBe(false);
      expect(shouldFailFast(ctx, new RuleResult(false))).toBe(false);
    });
  });

  describe('When failFast is true', () => {
    const ctx = new EnforceContext(null).setFailFast(true);
    it('Should return false when passing', () => {
      expect(shouldFailFast(ctx, new RuleResult(true))).toBe(false);
    });

    it('Should return true when failing', () => {
      expect(shouldFailFast(ctx, new RuleResult(false))).toBe(true);
    });
  });

  describe('When result is warning', () => {
    it('Should return false even when failed', () => {
      const ctx = new EnforceContext(null).setFailFast(true);
      const res = new RuleResult(false).setAttribute('warn', true);
      expect(shouldFailFast(ctx, res)).toBe(false);
    });
  });
});
