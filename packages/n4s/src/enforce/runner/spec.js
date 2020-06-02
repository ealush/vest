import rule from '.';

describe('Test rule runner', () => {
  describe('When failing output', () => {
    it('Should throw', () => {
      expect(() => rule(n => n === 2, 1)).toThrow(Error);
    });
  });

  describe('When passing output', () => {
    it('Should return silently', () => {
      expect(rule(n => n === 1, 1)).toBeUndefined();
    });
  });
});
