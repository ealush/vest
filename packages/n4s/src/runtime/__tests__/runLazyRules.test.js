import runLazyRules from 'runLazyRules';

describe('runLazyRules', () => {
  describe('When single rule passed', () => {
    it('Should run rule against value', () => {
      const rule = { run: jest.fn(() => true) };
      const value = { x: true };
      runLazyRules(rule, value);
      expect(rule.run).toHaveBeenCalledWith(value);
    });

    it('Should return true when successful', () => {
      const res = runLazyRules({ run: () => true }, 'some_value');
      expect(res).toPass();
    });

    it('Should return true when failing', () => {
      const res = runLazyRules({ run: () => false }, 'some_value');
      expect(res).not.toPass();
    });
  });

  describe('When an array of rules passed', () => {
    it('Should run each rule against value', () => {
      const rule_1 = { run: jest.fn(() => true) };
      const rule_2 = { run: jest.fn(() => true) };
      const rule_3 = { run: jest.fn(() => true) };
      const value = { x: true };
      runLazyRules([rule_1, rule_2, rule_3], value);
      expect(rule_1.run).toHaveBeenCalledWith(value);
      expect(rule_2.run).toHaveBeenCalledWith(value);
      expect(rule_3.run).toHaveBeenCalledWith(value);
    });

    it('Should return true when successful', () => {
      const rule_1 = { run: () => true };
      const rule_2 = { run: () => true };
      const rule_3 = { run: () => true };
      const res = runLazyRules([rule_1, rule_2, rule_3], 'some_value');
      expect(res).toPass();
    });

    it('Should return false when false', () => {
      const rule_1 = { run: () => false };
      const rule_2 = { run: () => false };
      const rule_3 = { run: () => false };
      const res = runLazyRules([rule_1, rule_2, rule_3], 'some_value', {});
      expect(res).not.toPass();
    });
  });
});
