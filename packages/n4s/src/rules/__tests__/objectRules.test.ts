import { describe, it, expect } from 'vitest';
import * as objectRules from '../objectRules';

describe('objectRules exports', () => {
  it('should export all object rules', () => {
    expect(objectRules.isKeyOf).toBeDefined();
    expect(objectRules.isNotKeyOf).toBeDefined();
    expect(objectRules.isValueOf).toBeDefined();
    expect(objectRules.isNotValueOf).toBeDefined();
  });
});
