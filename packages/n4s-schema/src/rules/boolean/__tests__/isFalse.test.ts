import { describe, it, expect } from 'vitest';


describe('isFalse', () => {
  it('passes only for false', () => {
    expect(isBoolean().isFalse().run(false).passes).toBe(true);
  });

  it('fails for true', () => {
    expect(isBoolean().isFalse().run(true).passes).toBe(false);
  });

  it('fails for falsy non-boolean values', () => {
    const values: any[] = [0, '', null, undefined, NaN];

    values.forEach(value => {
      expect(isBoolean().isFalse().run(value).passes).toBe(false);
    });
  });
});
