import enforceRunner from 'enforceRunner';

describe('Test runner', () => {
  describe('When failing output', () => {
    it('Should throw', () => {
      expect(() => enforceRunner(n => n === 2, 1)).toThrow(Error);
    });

    it('Should throw with verbose', () => {
      expect(() =>
        enforceRunner(() => ({ pass: false, message: 'Custom message' }))
      ).toThrow(Error);
    });
  });

  describe('When passing output', () => {
    it('Should return silently', () => {
      expect(enforceRunner(n => n === 1, 1)).toBeUndefined();
    });

    it('Should return silently', () => {
      expect(
        enforceRunner(() => ({ pass: true, message: 'Custom message' }))
      ).toBeUndefined();
    });
  });
});
