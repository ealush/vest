import { describe, it, expect } from 'vitest';


describe('isTruthy', () => {
  it('passes for true', () => {
    expect(isBoolean().enforceLazy.isTruthy().run(true).passes).toBe(true);
  });

  it('fails for false', () => {
    expect(isBoolean().enforceLazy.isTruthy().run(false).passes).toBe(false);
  });

  it('fails for truthy non-boolean values', () => {
    const values: any[] = [1, 'yes', {}, []];

    values.forEach(value => {
      expect(isBoolean().enforceLazy.isTruthy().run(value).passes).toBe(false);
    });
  });
});
