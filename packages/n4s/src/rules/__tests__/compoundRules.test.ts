import { describe, it, expect } from 'vitest';
import * as compoundRules from '../compoundRules/compoundRules';

describe('compoundRules exports', () => {
  it('should export all compound rules', () => {
    expect(compoundRules.allOf).toBeDefined();
    expect(compoundRules.anyOf).toBeDefined();
    expect(compoundRules.noneOf).toBeDefined();
    expect(compoundRules.oneOf).toBeDefined();
  });
});
