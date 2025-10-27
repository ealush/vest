import { describe, it, expect } from 'vitest';

import { RuleInstance } from '../enforce';
import { loose, partial, shape } from '../schemaRules';

const isNumber: RuleInstance<number> = {
  run: (v: any) => ({ passes: typeof v === 'number', type: v }),
  infer: {} as number,
};

const isString: RuleInstance<string> = {
  run: (v: any) => ({ passes: typeof v === 'string', type: v }),
  infer: {} as string,
};

const longerThan = (n: number): RuleInstance<string> => ({
  run: (v: any) => ({ passes: typeof v === 'string' && v.length > n, type: v }),
  infer: {} as string,
});

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

  it('Should pass when wrapped fields are undefined or null', () => {
    const shapeRule = shape(
      partial({
        username: longerThan(3),
        id: isNumber,
      }),
    );

    expect(shapeRule.run({}).passes).toBe(true);
    expect(shapeRule.run({ username: undefined, id: null }).passes).toBe(true);
  });

  it('Should pass when wrapped fields are valid', () => {
    const shapeRule = shape(
      partial({
        username: longerThan(3),
        id: isNumber,
      }),
    );
    expect(shapeRule.run({ username: 'foobar', id: 1 }).passes).toBe(true);
  });

  it('Should pass when some wrapped fields are missing', () => {
    const shapeRule = shape(
      partial({
        username: longerThan(3),
        id: isNumber,
      }),
    );
    expect(shapeRule.run({ username: 'foobar' }).passes).toBe(true);
  });

  it('Should fail when wrapped fields are invalid', () => {
    const shapeRule = shape(
      partial({
        username: longerThan(3),
        id: isNumber,
      }),
    );
    // @ts-expect-error
    expect(shapeRule.run({ username: 'foo', id: '1' }).passes).toBe(false);
  });

  it("Should retain rule's original constraints", () => {
    const partialSchema = partial({
      username: longerThan(3),
      id: isNumber,
    });
    const shapeRule = shape(partialSchema);
    const looseRule = loose(partialSchema);

    // shape is strict and fails on extra properties
    expect(
      // @ts-expect-error
      shapeRule.run({ username: 'foobar', id: 1, foo: 'bar' }).passes,
    ).toBe(false);

    // loose allows extra properties
    expect(
      looseRule.run({ username: 'foobar', id: 1, foo: 'bar' }).passes,
    ).toBe(true);
  });
});
