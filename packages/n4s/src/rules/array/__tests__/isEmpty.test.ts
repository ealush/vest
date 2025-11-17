import { describe, it, expect } from 'vitest';

import { enforce } from '../../../n4s';

describe('isEmpty', () => {
  it('pass for empty arrays', () => {
    expect(enforce.isArray<number>().isEmpty().run([]).pass).toBe(true);
    expect(enforce.isArray<string>().isEmpty().run([]).pass).toBe(true);
    expect(enforce.isArray<any>().isEmpty().run([]).pass).toBe(true);
  });

  it('fails for non-empty arrays', () => {
    expect(enforce.isArray<number>().isEmpty().run([1]).pass).toBe(false);
    expect(enforce.isArray<string>().isEmpty().run(['a']).pass).toBe(false);
    expect(enforce.isArray<null>().isEmpty().run([null]).pass).toBe(false);
  });
});
