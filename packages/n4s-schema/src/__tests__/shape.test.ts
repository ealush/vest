import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('shape', () => {
  const schema = {
    name: enforceLazy.isString(),
    age: enforceLazy.isNumber(),
  };

  it('should return a rule instance', () => {
    const rule = enforceLazy.shape(schema);
    expect(rule).toHaveProperty('run');
    expect(rule).toHaveProperty('infer');
  });

  it('should pass with exact matching object', () => {
    const rule = enforceLazy.shape(schema);
    const result = rule.run({ name: 'John', age: 30 });
    expect(result.pass).toBe(true);
  });

  it('should fail with extra properties', () => {
    const rule = enforceLazy.shape(schema);
    // @ts-expect-error
    const result = rule.run({ name: 'John', age: 30, extra: 'property' });
    expect(result.pass).toBe(false);
  });

  it('should fail if a property is missing', () => {
    const rule = enforceLazy.shape(schema);
    // @ts-expect-error
    const result = rule.run({ name: 'John' });
    expect(result.pass).toBe(false);
  });

  it('should fail if a property has wrong type', () => {
    const rule = enforceLazy.shape(schema);
    // @ts-expect-error
    const result = rule.run({ name: 'John', age: '30' });
    expect(result.pass).toBe(false);
  });

  it('should fail with empty object', () => {
    const rule = enforceLazy.shape(schema);
    // @ts-expect-error
    const result = rule.run({});
    expect(result.pass).toBe(false);
  });

  it('should pass with an empty schema and empty object', () => {
    const rule = enforceLazy.shape({});
    const result = rule.run({});
    expect(result.pass).toBe(true);
  });

  it('should fail with an empty schema and non-empty object', () => {
    const rule = enforceLazy.shape({});
    const result = rule.run({ any: 'value' });
    expect(result.pass).toBe(false);
  });
});
