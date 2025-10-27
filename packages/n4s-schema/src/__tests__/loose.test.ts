import { describe, it, expect } from 'vitest';

import { RuleInstance } from '../enforce';
import { loose } from '../schemaRules';

const isNumber: RuleInstance<number> = {
  run: (v: any) => ({ passes: typeof v === 'number', type: v }),
  infer: {} as number,
};

const isString: RuleInstance<string> = {
  run: (v: any) => ({ passes: typeof v === 'string', type: v }),
  infer: {} as string,
};

describe('loose', () => {
  const schema = {
    name: isString,
    age: isNumber,
  };

  it('should return a rule instance', () => {
    const rule = loose(schema);
    expect(rule).toHaveProperty('run');
    expect(rule).toHaveProperty('infer');
  });

  it('should pass with exact matching object', () => {
    const rule = loose(schema);
    const result = rule.run({ name: 'John', age: 30 });
    expect(result.passes).toBe(true);
  });

  it('should pass with extra properties', () => {
    const rule = loose(schema);
    const result = rule.run({ name: 'John', age: 30, extra: 'property' });
    expect(result.passes).toBe(true);
  });

  it('should fail if a property is missing', () => {
    const rule = loose(schema);
    // @ts-expect-error
    const result = rule.run({ name: 'John' });
    expect(result.passes).toBe(false);
  });

  it('should fail if a property has wrong type', () => {
    const rule = loose(schema);
    // @ts-expect-error
    const result = rule.run({ name: 'John', age: '30' });
    expect(result.passes).toBe(false);
  });

  it('should fail with empty object', () => {
    const rule = loose(schema);
    // @ts-expect-error
    const result = rule.run({});
    expect(result.passes).toBe(false);
  });

  it('should pass with an empty schema', () => {
    const rule = loose({});
    const result = rule.run({ any: 'value' });
    expect(result.passes).toBe(true);
  });
});
