import runner from '.';

describe('Test rule runner', () => {
  describe('When failing output', () => {
    it('Should return false', () => {
      expect(runner(n => n === 2, 1)).toBe(false);
    });
  });

  describe('When passing output', () => {
    it('Should return true', () => {
      expect(runner(n => n === 1, 1)).toBe(true);
    });
  });
});
