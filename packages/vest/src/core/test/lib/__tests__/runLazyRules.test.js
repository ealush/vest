import runLazyRules from 'runLazyRules';

describe('runLazyRules', () => {
  describe('When single rule passed', () => {
    it('Should run rule against value', () => {
      const rule = { test: jest.fn(() => true) };
      const value = { x: true };
      runLazyRules(rule, value);
      expect(rule.test).toHaveBeenCalledWith(value);
    });

    it('Should return true when successful', () => {
      const res = runLazyRules({ test: () => true }, 'some_value');
      expect(res).toBe(true);
    });

    it('Should return true when failing', () => {
      const res = runLazyRules({ test: () => false }, 'some_value');
      expect(res).toBe(false);
    });
  });

  describe('When an array of rules passed', () => {
    it('Should run each rule against value', () => {
      const rule_1 = { test: jest.fn(() => true) };
      const rule_2 = { test: jest.fn(() => true) };
      const rule_3 = { test: jest.fn(() => true) };
      const value = { x: true };
      runLazyRules([rule_1, rule_2, rule_3], value);
      expect(rule_1.test).toHaveBeenCalledWith(value);
      expect(rule_2.test).toHaveBeenCalledWith(value);
      expect(rule_3.test).toHaveBeenCalledWith(value);
    });

    it('Should return true when successful', () => {
      const rule_1 = { test: () => true };
      const rule_2 = { test: () => true };
      const rule_3 = { test: () => true };
      const res = runLazyRules([rule_1, rule_2, rule_3], 'some_value');
      expect(res).toBe(true);
    });

    it('Should return false when false', () => {
      const rule_1 = { test: () => false };
      const rule_2 = { test: () => false };
      const rule_3 = { test: () => false };
      const res = runLazyRules([rule_1, rule_2, rule_3], 'some_value');
      expect(res).toBe(false);
    });
  });
});
