import { describe, expect, it } from 'vitest';

import { getLazyRule } from '../lazyRegistry';

describe('lazyRegistry', () => {
  it('does not expose Object.prototype members as registered rules', () => {
    expect(getLazyRule('toString')).toBeUndefined();
    expect(getLazyRule('constructor')).toBeUndefined();
    expect(getLazyRule('__proto__')).toBeUndefined();
  });
});
