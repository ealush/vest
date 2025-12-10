import { describe, it, expect } from 'vitest';
import * as booleanRules from '../booleanRules';

describe('booleanRules exports', () => {
  it('should export expected rules', () => {
    expect(booleanRules.isBoolean).toBeDefined();
    expect(booleanRules.isFalse).toBeDefined();
    expect(booleanRules.isTrue).toBeDefined();
    expect(booleanRules.isTruthy).toBeDefined();
    expect(booleanRules.isFalsy).toBeDefined();
    expect(booleanRules.equals).toBeDefined();
  });
});
