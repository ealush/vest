import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('equals', () => {
  it('pass when values match', () => {
    expect(enforceLazy.isBoolean().equals(true).run(true).pass).toBe(true);
    expect(enforceLazy.isBoolean().equals(false).run(false).pass).toBe(true);
  });

  it('fails when values differ', () => {
    expect(enforceLazy.isBoolean().equals(true).run(false).pass).toBe(false);
    expect(enforceLazy.isBoolean().equals(false).run(true).pass).toBe(false);
  });
});
