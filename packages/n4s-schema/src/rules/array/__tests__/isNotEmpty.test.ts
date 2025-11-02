import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('isNotEmpty', () => {
  it('pass for non-empty arrays', () => {
    expect(enforceLazy.isArray<number>().isNotEmpty().run([1]).pass).toBe(true);
    expect(
      enforceLazy.isArray<string>().isNotEmpty().run(['a', 'b']).pass,
    ).toBe(true);
    expect(enforceLazy.isArray<null>().isNotEmpty().run([null]).pass).toBe(
      true,
    );
  });

  it('fails for empty arrays', () => {
    expect(enforceLazy.isArray<number>().isNotEmpty().run([]).pass).toBe(false);
    expect(enforceLazy.isArray<string>().isNotEmpty().run([]).pass).toBe(false);
    expect(enforceLazy.isArray<any>().isNotEmpty().run([]).pass).toBe(false);
  });
});
