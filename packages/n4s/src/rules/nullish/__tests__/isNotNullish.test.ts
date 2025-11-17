import { describe, it, expect } from 'vitest';

import { enforce } from '../../../n4s';

describe('isNotNullish', () => {
  it('pass for falsy non-nullish values', () => {
    const values: any[] = [0, '', false, NaN];

    values.forEach(value => {
      expect(enforce.isNotNullish().run(value).pass).toBe(true);
    });
  });

  it('pass for truthy values', () => {
    const values: any[] = [1, 'text', true, {}, [], () => {}];

    values.forEach(value => {
      expect(enforce.isNotNullish().run(value).pass).toBe(true);
    });
  });

  it('fails for null', () => {
    expect(enforce.isNotNullish().run(null).pass).toBe(false);
  });

  it('fails for undefined', () => {
    expect(enforce.isNotNullish().run(undefined).pass).toBe(false);

    let uninitialized: any;
    expect(enforce.isNotNullish().run(uninitialized).pass).toBe(false);
  });
});
