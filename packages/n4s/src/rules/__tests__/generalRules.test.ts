import { describe, it, expect } from 'vitest';
import * as generalRules from '../generalRules';

describe('generalRules exports', () => {
  it('should export all general rules', () => {
    expect(generalRules.condition).toBeDefined();
    expect(generalRules.equals).toBeDefined();
    expect(generalRules.notEquals).toBeDefined();
    expect(generalRules.isEmpty).toBeDefined();
    expect(generalRules.isFalsy).toBeDefined();
    expect(generalRules.isNaN).toBeDefined();
    expect(generalRules.isNotArray).toBeDefined();
    expect(generalRules.isNotBoolean).toBeDefined();
    expect(generalRules.isNotEmpty).toBeDefined();
    expect(generalRules.isNotNaN).toBeDefined();
    expect(generalRules.isNotNumber).toBeDefined();
    expect(generalRules.isNotNumeric).toBeDefined();
    expect(generalRules.isNotString).toBeDefined();
    expect(generalRules.isTruthy).toBeDefined();
    expect(generalRules.isNotNull).toBeDefined();
    expect(generalRules.isNotUndefined).toBeDefined();
    expect(generalRules.isNotNullish).toBeDefined();
    expect(generalRules.isBlank).toBeDefined();
    expect(generalRules.isNotBlank).toBeDefined();
  });
});
