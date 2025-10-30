import {
  isNotNull,
  isNotNullish,
  isNotUndefined,
  isNull,
  isNullish,
  isUndefined,
} from 'rules';
import { describe, expect, it } from 'vitest';

describe('nullishRules', () => {
  it('isNull / isNotNull', () => {
    expect(isNull().run(null).passes).toBe(true);
    expect(isNull().run(undefined).passes).toBe(false);
    expect(isNotNull().run(0).passes).toBe(true);
    expect(isNotNull().run(null).passes).toBe(false);
  });

  it('isUndefined / isNotUndefined', () => {
    expect(isUndefined().run(undefined).passes).toBe(true);
    expect(isUndefined().run(null).passes).toBe(false);
    expect(isNotUndefined().run('x').passes).toBe(true);
    expect(isNotUndefined().run(undefined).passes).toBe(false);
  });

  it('isNullish / isNotNullish', () => {
    expect(isNullish().run(undefined).passes).toBe(true);
    expect(isNullish().run(null).passes).toBe(true);
    expect(isNullish().run(0).passes).toBe(false);

    expect(isNotNullish().run(0).passes).toBe(true);
    expect(isNotNullish().run('').passes).toBe(true);
    expect(isNotNullish().run(undefined).passes).toBe(false);
  });
});
