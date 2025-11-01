import { describe, it, expect } from 'vitest';

import { isArray } from '../isArray';

describe('isEmpty', () => {
  it('passes for empty arrays', () => {
    expect(isArray<number>().isEmpty().run([]).passes).toBe(true);
    expect(isArray<string>().isEmpty().run([]).passes).toBe(true);
    expect(isArray<any>().isEmpty().run([]).passes).toBe(true);
  });

  it('fails for non-empty arrays', () => {
    expect(isArray<number>().isEmpty().run([1]).passes).toBe(false);
    expect(isArray<string>().isEmpty().run(['a']).passes).toBe(false);
    expect(isArray<null>().isEmpty().run([null]).passes).toBe(false);
  });
});
