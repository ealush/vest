import { describe, it, expect } from 'vitest';
import { shape } from '../schemaRules';
import { RuleInstance } from '../enforce';

const isNumber: RuleInstance<number> = {
  run: (v: any) => ({ passes: typeof v === 'number', type: v }),
  infer: {} as number,
};

const isString: RuleInstance<string> = {
  run: (v: any) => ({ passes: typeof v === 'string', type: v }),
  infer: {} as string,
};

describe('shape', () => {
  const schema = {
    name: isString,
    age: isNumber,
  };

  it('should return a rule instance', () => {
    const rule = shape(schema);
    expect(rule).toHaveProperty('run');
    expect(rule).toHaveProperty('infer');
  });

  it('should pass with exact matching object', () => {
    const rule = shape(schema);
    const result = rule.run({ name: 'John', age: 30 });
    expect(result.passes).toBe(true);
  });

  it('should fail with extra properties', () => {
    const rule = shape(schema);
    const result = rule.run({ name: 'John', age: 30, extra: 'property' });
    expect(result.passes).toBe(false);
  });

  it('should fail if a property is missing', () => {
    const rule = shape(schema);
    const result = rule.run({ name: 'John' });
    expect(result.passes).toBe(false);
  });

  it('should fail if a property has wrong type', () => {
    const rule = shape(schema);
    const result = rule.run({ name: 'John', age: '30' });
    expect(result.passes).toBe(false);
  });

  it('should fail with empty object', () => {
    const rule = shape(schema);
    const result = rule.run({});
    expect(result.passes).toBe(false);
  });

  it('should pass with an empty schema and empty object', () => {
    const rule = shape({});
    const result = rule.run({});
    expect(result.passes).toBe(true);
  });

  it('should fail with an empty schema and non-empty object', () => {
    const rule = shape({});
    const result = rule.run({ any: 'value' });
    expect(result.passes).toBe(false);
  });
});