import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('isTrue', () => {
  it('passes only for true', () => {
    expect(enforceLazy.isBoolean().isTrue().run(true).passes).toBe(true);
  });

  it('fails for false', () => {
    expect(enforceLazy.isBoolean().isTrue().run(false).passes).toBe(false);
  });

  it('fails for truthy non-boolean values', () => {
    const values: any[] = [1, 'true', 'yes', {}, [], () => {}];

    values.forEach(value => {
      expect(enforceLazy.isBoolean().isTrue().run(value).passes).toBe(false);
    });
  });
});
