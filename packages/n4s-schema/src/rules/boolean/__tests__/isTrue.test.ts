import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('isTrue', () => {
  it('pass only for true', () => {
    expect(enforceLazy.isBoolean().isTrue().run(true).pass).toBe(true);
  });

  it('fails for false', () => {
    expect(enforceLazy.isBoolean().isTrue().run(false).pass).toBe(false);
  });

  it('fails for truthy non-boolean values', () => {
    const values: any[] = [1, 'true', 'yes', {}, [], () => {}];

    values.forEach(value => {
      expect(enforceLazy.isBoolean().isTrue().run(value).pass).toBe(false);
    });
  });
});
