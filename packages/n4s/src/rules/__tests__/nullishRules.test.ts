import { describe, it, expect } from 'vitest';
import * as nullishRules from '../nullishRules';

describe('nullishRules exports', () => {
  it('should export all nullish rules', () => {
    expect(nullishRules.isNull).toBeDefined();
    expect(nullishRules.isUndefined).toBeDefined();
    expect(nullishRules.isNullish).toBeDefined();
  });
});
