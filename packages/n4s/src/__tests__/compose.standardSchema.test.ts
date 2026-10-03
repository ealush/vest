import { describe, expect, it } from 'vitest';

import { compose, enforce } from '../n4s';

describe('compose() rule surface', () => {
  const isAdult = compose(
    enforce.isNumber(),
    enforce.isNumber().greaterThanOrEquals(18),
  );

  it('implements Standard Schema', () => {
    expect(isAdult['~standard'].vendor).toBe('n4s');
    expect(isAdult['~standard'].version).toBe(1);
    expect(isAdult['~standard'].validate(21)).toEqual({ value: 21 });
    expect(isAdult['~standard'].validate(5)).toMatchObject({
      issues: [expect.objectContaining({ path: [] })],
    });
  });

  it('supports validate() and parse()', () => {
    expect(isAdult.validate(30)).toEqual({ value: 30 });
    expect(isAdult.validate(10).issues).toHaveLength(1);
    expect(isAdult.parse(30)).toBe(30);
    expect(() => isAdult.parse(10)).toThrow(TypeError);
  });

  it('keeps run(), test() and the callable assertion', () => {
    expect(isAdult.run(30).pass).toBe(true);
    expect(isAdult.test(10)).toBe(false);
    expect(() => isAdult(30)).not.toThrow();
    expect(() => isAdult(10)).toThrow();
  });

  it('reports the failing composite path through validate()', () => {
    const user = compose(enforce.shape({ name: enforce.isString() }));
    expect(user.validate({ name: 1 })).toMatchObject({
      issues: [expect.objectContaining({ path: ['name'] })],
    });
  });
});
