import { describe, it, expect } from 'vitest';
import { partial, shape } from '../schemaRules';
import { RuleInstance } from '../enforce';

const isNumber: RuleInstance<number> = {
  run: (v: any) => ({ passes: typeof v === 'number', type: v }),
  infer: {} as number,
};

const isString: RuleInstance<string> = {
  run: (v: any) => ({ passes: typeof v === 'string', type: v }),
  infer: {} as string,
};

describe('partial', () => {
  const schema = {
    name: isString,
    age: isNumber,
  };

  it('should return a schema with optional rules', () => {
    const partialSchema = partial(schema);
    expect(partialSchema.name).toHaveProperty('run');
    expect(partialSchema.age).toHaveProperty('run');

    // Test if they are actually optional
    expect(partialSchema.name.run(undefined).passes).toBe(true);
    expect(partialSchema.age.run(undefined).passes).toBe(true);
  });

  it('should work with shape to validate partial objects', () => {
    const partialSchema = partial(schema);
    const shapeRule = shape(partialSchema);

    expect(shapeRule.run({ name: 'John' }).passes).toBe(true);
    expect(shapeRule.run({ age: 30 }).passes).toBe(true);
    expect(shapeRule.run({}).passes).toBe(true);
    expect(shapeRule.run({ name: 'John', age: 30 }).passes).toBe(true);
  });

  it('should fail if a property has wrong type', () => {
    const partialSchema = partial(schema);
    const shapeRule = shape(partialSchema);

    expect(shapeRule.run({ name: 123 }).passes).toBe(false);
    expect(shapeRule.run({ age: '30' }).passes).toBe(false);
    expect(shapeRule.run({ name: 'John', age: '30' }).passes).toBe(false);
  });
});