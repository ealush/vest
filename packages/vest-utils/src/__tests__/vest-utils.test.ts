import { describe, it, expect } from 'vitest';
import * as vestUtils from '../vest-utils';

describe('vest-utils exports', () => {
  it('should export expected utilities', () => {
    expect(vestUtils.noop).toBeDefined();
    expect(vestUtils.isFunction).toBeDefined();
    expect(vestUtils.withResolvers).toBeDefined();
    // Verify a few others to ensure the file is processed
    expect(vestUtils.defaultTo).toBeDefined();
    expect(vestUtils.assign).toBeDefined();
  });
});
