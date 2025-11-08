import { describe, expect, it } from 'vitest';

import { enforce } from 'n4s';

describe('nullishRules', () => {
  it('isNull / isNotNull', () => {
    expect(enforce.isNull().run(null).pass).toBe(true);
    expect(enforce.isNull().run(undefined).pass).toBe(false);
    expect(enforce.isNotNull().run(0).pass).toBe(true);
    expect(enforce.isNotNull().run(null).pass).toBe(false);
  });

  it('isUndefined / isNotUndefined', () => {
    expect(enforce.isUndefined().run(undefined).pass).toBe(true);
    expect(enforce.isUndefined().run(null).pass).toBe(false);
    expect(enforce.isNotUndefined().run('x').pass).toBe(true);
    expect(enforce.isNotUndefined().run(undefined).pass).toBe(false);
  });

  it('isNullish / isNotNullish', () => {
    expect(enforce.isNullish().run(undefined).pass).toBe(true);
    expect(enforce.isNullish().run(null).pass).toBe(true);
    expect(enforce.isNullish().run(0).pass).toBe(false);

    expect(enforce.isNotNullish().run(0).pass).toBe(true);
    expect(enforce.isNotNullish().run('').pass).toBe(true);
    expect(enforce.isNotNullish().run(undefined).pass).toBe(false);
  });
});
