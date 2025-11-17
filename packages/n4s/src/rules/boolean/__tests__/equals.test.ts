import { describe, it, expect } from 'vitest';

import { enforce } from '../../../n4s';

describe('equals', () => {
  it('pass when values match', () => {
    expect(enforce.isBoolean().equals(true).run(true).pass).toBe(true);
    expect(enforce.isBoolean().equals(false).run(false).pass).toBe(true);
  });

  it('fails when values differ', () => {
    expect(enforce.isBoolean().equals(true).run(false).pass).toBe(false);
    expect(enforce.isBoolean().equals(false).run(true).pass).toBe(false);
  });
});
