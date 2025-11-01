import { describe, it, expect } from 'vitest';

import { isBoolean } from '../isBoolean';

describe('isTrue', () => {
  it('passes only for true', () => {
    expect(isBoolean().isTrue().run(true).passes).toBe(true);
  });

  it('fails for false', () => {
    expect(isBoolean().isTrue().run(false).passes).toBe(false);
  });

  it('fails for truthy non-boolean values', () => {
    const values: any[] = [1, 'true', 'yes', {}, [], () => {}];

    values.forEach(value => {
      expect(isBoolean().isTrue().run(value).passes).toBe(false);
    });
  });
});
