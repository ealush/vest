import rule from '.';

describe('Test rule runner', () => {
  describe('When failing output', () => {
    it('Should throw', () => {
      expect(() => rule(n => n === 2, 1)).toThrow(Error);
    });

    it('Should throw with verbose', () => {
      expect(() =>
        rule(() => ({ pass: false, message: 'Custom message' }))
      ).toThrow(Error);
    });
  });

  describe('When passing output', () => {
    it('Should return silently', () => {
      expect(rule(n => n === 1, 1)).toBeUndefined();
    });

    it('Should return silently', () => {
      expect(
        rule(() => ({ pass: true, message: 'Custom message' }))
      ).toBeUndefined();
    });
  });
});
