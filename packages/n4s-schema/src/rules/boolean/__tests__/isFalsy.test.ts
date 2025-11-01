import { describe, it, expect } from 'vitest';


describe('isFalsy', () => {
  it('passes for false', () => {
    expect(isBoolean().enforceLazy.isFalsy().run(false).passes).toBe(true);
  });

  it('fails for true', () => {
    expect(isBoolean().enforceLazy.isFalsy().run(true).passes).toBe(false);
  });

  it('fails for falsy non-boolean values', () => {
    const values: any[] = [0, '', null, undefined, NaN];

    values.forEach(value => {
      expect(isBoolean().enforceLazy.isFalsy().run(value).passes).toBe(false);
    });
  });
});
