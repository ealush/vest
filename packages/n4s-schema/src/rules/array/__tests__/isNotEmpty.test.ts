import { describe, it, expect } from 'vitest';

import { isArray } from '../isArray';

describe('isNotEmpty', () => {
  it('passes for non-empty arrays', () => {
    expect(isArray<number>().isNotEmpty().run([1]).passes).toBe(true);
    expect(isArray<string>().isNotEmpty().run(['a', 'b']).passes).toBe(true);
    expect(isArray<null>().isNotEmpty().run([null]).passes).toBe(true);
  });

  it('fails for empty arrays', () => {
    expect(isArray<number>().isNotEmpty().run([]).passes).toBe(false);
    expect(isArray<string>().isNotEmpty().run([]).passes).toBe(false);
    expect(isArray<any>().isNotEmpty().run([]).passes).toBe(false);
  });
});
