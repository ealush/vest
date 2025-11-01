import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('isEmpty', () => {
  it('passes for empty arrays', () => {
    expect(enforceLazy.isArray<number>().isEmpty().run([]).passes).toBe(true);
    expect(enforceLazy.isArray<string>().isEmpty().run([]).passes).toBe(true);
    expect(enforceLazy.isArray<any>().isEmpty().run([]).passes).toBe(true);
  });

  it('fails for non-empty arrays', () => {
    expect(enforceLazy.isArray<number>().isEmpty().run([1]).passes).toBe(false);
    expect(enforceLazy.isArray<string>().isEmpty().run(['a']).passes).toBe(
      false,
    );
    expect(enforceLazy.isArray<null>().isEmpty().run([null]).passes).toBe(
      false,
    );
  });
});
