import { describe, it, expect } from 'vitest';

import { enforceLazy } from '../../../lazy';

describe('isNotEmpty', () => {
  it('passes for non-empty arrays', () => {
    expect(enforceLazy.isArray<number>().isNotEmpty().run([1]).passes).toBe(true);
    expect(enforceLazy.isArray<string>().isNotEmpty().run(['a', 'b']).passes).toBe(true);
    expect(enforceLazy.isArray<null>().isNotEmpty().run([null]).passes).toBe(true);
  });

  it('fails for empty arrays', () => {
    expect(enforceLazy.isArray<number>().isNotEmpty().run([]).passes).toBe(false);
    expect(enforceLazy.isArray<string>().isNotEmpty().run([]).passes).toBe(false);
    expect(enforceLazy.isArray<any>().isNotEmpty().run([]).passes).toBe(false);
  });
});
