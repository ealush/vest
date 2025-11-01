import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('equals', () => {
  it('passes when values match', () => {
    expect(enforceLazy.isBoolean().equals(true).run(true).passes).toBe(true);
    expect(enforceLazy.isBoolean().equals(false).run(false).passes).toBe(true);
  });

  it('fails when values differ', () => {
    expect(enforceLazy.isBoolean().equals(true).run(false).passes).toBe(false);
    expect(enforceLazy.isBoolean().equals(false).run(true).passes).toBe(false);
  });
});
