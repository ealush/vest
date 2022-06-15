import mapFirst from 'mapFirst';

describe('mapFirst', () => {
  it('should return the broken out result', () => {
    const result = mapFirst([1, 2, 3], (value, breakout) => {
      breakout(value === 3, { pass: true });
    });

    expect(result).toEqual({ pass: true });
  });

  it('Should respect the breakout conditional', () => {
    const result = mapFirst([1, 2, 3], (_, breakout) => {
      breakout(false, 0);
      breakout(false, 0);
      breakout(true, 1);
    });

    expect(result).toBe(1);
  });

  describe('When not broken out', () => {
    it('Should return undefined', () => {
      const result = mapFirst([1, 2, 3], () => {});

      expect(result).toBeUndefined();
    });
  });
});
