import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('isEmpty', () => {
  it('pass for empty arrays', () => {
    expect(enforceLazy.isArray<number>().isEmpty().run([]).pass).toBe(true);
    expect(enforceLazy.isArray<string>().isEmpty().run([]).pass).toBe(true);
    expect(enforceLazy.isArray<any>().isEmpty().run([]).pass).toBe(true);
  });

  it('fails for non-empty arrays', () => {
    expect(enforceLazy.isArray<number>().isEmpty().run([1]).pass).toBe(false);
    expect(enforceLazy.isArray<string>().isEmpty().run(['a']).pass).toBe(false);
    expect(enforceLazy.isArray<null>().isEmpty().run([null]).pass).toBe(false);
  });
});
