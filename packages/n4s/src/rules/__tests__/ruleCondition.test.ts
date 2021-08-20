import enforce from 'n4s';

import ruleReturn, { failing, passing } from 'ruleReturn';

describe('enforce.condition', () => {
  it('Should pass down enforced value to condition as the first argument', () => {
    const condition = jest.fn(() => true);

    enforce(1).condition(condition);
    expect(condition).toHaveBeenCalledWith(1);

    enforce.condition(condition).run(2);
    expect(condition).toHaveBeenCalledWith(2);
  });

  describe('Lazy interface', () => {
    it('Should return a failing result if condition is failing', () => {
      expect(enforce.condition(() => false).run(1)).toEqual(failing());
      expect(enforce.condition(() => failing()).run(1)).toEqual(failing());
      expect(
        enforce.condition(() => ruleReturn(false, 'failure message')).run(1)
      ).toEqual(ruleReturn(false, 'failure message'));
    });

    it('Should return a passing result if condition is passing', () => {
      expect(enforce.condition(() => true).run(1)).toEqual(passing());
      expect(enforce.condition(() => passing()).run(1)).toEqual(passing());
      expect(
        enforce.condition(() => ruleReturn(true, 'success message')).run(1)
      ).toEqual(passing());
    });
  });

  describe('Eager interface', () => {
    it('Should throw an error if condition is failing', () => {
      expect(() => enforce(1).condition(() => false)).toThrow();

      expect(() => enforce(1).condition(() => failing())).toThrow();

      expect(() =>
        enforce(1).condition(() => ruleReturn(false, 'failure message'))
      ).toThrow();
    });

    it('Should return silently if condition is passing', () => {
      expect(() => enforce(1).condition(() => true)).not.toThrow();

      expect(() => enforce(1).condition(() => passing())).not.toThrow();

      expect(() =>
        enforce(1).condition(() => ruleReturn(true, 'success message'))
      ).not.toThrow();
    });
  });

  describe('Error handling', () => {
    it('Should fail if not a function', () => {
      expect(() => enforce().condition('not a function')).toThrow();
      expect(enforce.condition('not a function').run(1)).toEqual(failing());
    });

    it('Should throw an error if condition returns a non-boolean or a non-ruleReturn', () => {
      expect(() => enforce(1).condition(() => 1)).toThrow();
      expect(() => enforce(1).condition(() => undefined)).toThrow();
      expect(() => enforce(1).condition(() => 'not a boolean')).toThrow();
      expect(() => enforce(1).condition(() => ruleReturn())).toThrow();
      expect(() => enforce.condition(() => 1).run(1)).toThrow();
    });
  });
});
