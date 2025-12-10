import { describe, it, expect } from 'vitest';
import * as vest from '../vest';

describe('vest exports', () => {
  it('should export all public API methods', () => {
    expect(vest.create).toBeDefined();
    expect(vest.test).toBeDefined();
    expect(vest.group).toBeDefined();
    expect(vest.optional).toBeDefined();
    expect(vest.enforce).toBeDefined();
    expect(vest.skip).toBeDefined();
    expect(vest.skipWhen).toBeDefined();
    expect(vest.omitWhen).toBeDefined();
    expect(vest.only).toBeDefined();
    expect(vest.warn).toBeDefined();
    expect(vest.include).toBeDefined();
    expect(vest.suiteSelectors).toBeDefined();
    expect(vest.each).toBeDefined();
    expect(vest.mode).toBeDefined();
    expect(vest.Modes).toBeDefined();
    expect(vest.registerReconciler).toBeDefined();
  });
});
