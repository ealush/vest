import { testVerifyProxy } from '../../../testUtils/testVerifyProxy';

testVerifyProxy(enforce => {
  describe('enforce().not modifier', () => {
    it('Should negate next rule result', () => {
      expect(() => enforce(1).not.equals(2)).not.toThrow();
      expect(() => enforce(1).not.equals(1)).toThrow();
    });

    it('Should allow further chaining of rules', () => {
      expect(typeof enforce(1).not.equals).toBe('function');
      expect(typeof enforce(1).not.equals(2).greaterThan).toBe('function');
    });

    it('Should respect multiple chained `not` modifiers', () => {
      expect(() =>
        enforce(1).not.equals(2).not.equals(3).not.equals(4)
      ).not.toThrow();
      expect(() =>
        enforce(1).not.equals(2).not.equals(3).not.equals(4).equals(5)
      ).toThrow();
    });
  });
});
