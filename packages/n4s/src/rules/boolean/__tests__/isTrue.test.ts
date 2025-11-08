import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s';

describe('isTrue', () => {
  it('pass only for true', () => {
    expect(enforce.isBoolean().isTrue().run(true).pass).toBe(true);
  });

  it('fails for false', () => {
    expect(enforce.isBoolean().isTrue().run(false).pass).toBe(false);
  });

  it('fails for truthy non-boolean values', () => {
    const values: any[] = [1, 'true', 'yes', {}, [], () => {}];

    values.forEach(value => {
      expect(enforce.isBoolean().isTrue().run(value).pass).toBe(false);
    });
  });
});
