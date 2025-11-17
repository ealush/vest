import { describe, it, expect } from 'vitest';

import { enforce } from '../../../n4s';

describe('isNotEmpty', () => {
  it('pass for non-empty arrays', () => {
    expect(enforce.isArray<number>().isNotEmpty().run([1]).pass).toBe(true);
    expect(enforce.isArray<string>().isNotEmpty().run(['a', 'b']).pass).toBe(
      true,
    );
    expect(enforce.isArray<null>().isNotEmpty().run([null]).pass).toBe(true);
  });

  it('fails for empty arrays', () => {
    expect(enforce.isArray<number>().isNotEmpty().run([]).pass).toBe(false);
    expect(enforce.isArray<string>().isNotEmpty().run([]).pass).toBe(false);
    expect(enforce.isArray<any>().isNotEmpty().run([]).pass).toBe(false);
  });
});
