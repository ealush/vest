import { describe, it, expect } from 'vitest';

import { isBoolean } from '../isBoolean';

describe('equals', () => {
  it('passes when values match', () => {
    expect(isBoolean().equals(true).run(true).passes).toBe(true);
    expect(isBoolean().equals(false).run(false).passes).toBe(true);
  });

  it('fails when values differ', () => {
    expect(isBoolean().equals(true).run(false).passes).toBe(false);
    expect(isBoolean().equals(false).run(true).passes).toBe(false);
  });
});
