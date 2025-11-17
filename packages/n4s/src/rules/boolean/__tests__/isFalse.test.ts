import { describe, it, expect } from 'vitest';

import { enforce } from '../../../n4s';

describe('isFalse', () => {
  it('pass only for false', () => {
    expect(enforce.isBoolean().isFalse().run(false).pass).toBe(true);
  });

  it('fails for true', () => {
    expect(enforce.isBoolean().isFalse().run(true).pass).toBe(false);
  });

  it('fails for falsy non-boolean values', () => {
    const values: any[] = [0, '', null, undefined, NaN];

    values.forEach(value => {
      expect(enforce.isBoolean().isFalse().run(value).pass).toBe(false);
    });
  });
});
