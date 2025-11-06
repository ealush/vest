import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s-schema';
import { RuleInstance } from 'enforceUtil';

const longerThan = (n: number): RuleInstance<string> => ({
  run: (v: any) => ({ pass: typeof v === 'string' && v.length > n, type: v }),
  infer: {} as string,
});

describe('partial', () => {
  const schema = {
    name: enforce.isString(),
    age: enforce.isNumber(),
  };

  it('should return a schema with optional rules', () => {
    const partialSchema = enforce.partial(schema);
    expect(partialSchema.name).toHaveProperty('run');
    expect(partialSchema.age).toHaveProperty('run');

    // Test if they are actually optional
    expect(partialSchema.name.run(undefined).pass).toBe(true);
    expect(partialSchema.age.run(undefined).pass).toBe(true);
  });

  it('should work with shape to validate partial objects', () => {
    const partialSchema = enforce.partial(schema);
    const shapeRule = enforce.shape(partialSchema);

    expect(shapeRule.run({ name: 'John' }).pass).toBe(true);
    expect(shapeRule.run({ age: 30 }).pass).toBe(true);
    expect(shapeRule.run({}).pass).toBe(true);
    expect(shapeRule.run({ name: 'John', age: 30 }).pass).toBe(true);
  });

  it('should fail if a property has wrong type', () => {
    const partialSchema = enforce.partial(schema);
    const shapeRule = enforce.shape(partialSchema);

    // @ts-expect-error
    expect(shapeRule.run({ name: 123 }).pass).toBe(false);
    // @ts-expect-error
    expect(shapeRule.run({ age: '30' }).pass).toBe(false);
    // @ts-expect-error
    expect(shapeRule.run({ name: 'John', age: '30' }).pass).toBe(false);
  });

  it('Should pass when wrapped fields are undefined or null', () => {
    const shapeRule = enforce.shape(
      enforce.partial({
        username: longerThan(3),
        id: enforce.isNumber(),
      }),
    );

    expect(shapeRule.run({}).pass).toBe(true);
    expect(shapeRule.run({ username: undefined, id: null }).pass).toBe(true);
  });

  it('Should pass when wrapped fields are valid', () => {
    const shapeRule = enforce.shape(
      enforce.partial({
        username: longerThan(3),
        id: enforce.isNumber(),
      }),
    );
    expect(shapeRule.run({ username: 'foobar', id: 1 }).pass).toBe(true);
  });

  it('Should pass when some wrapped fields are missing', () => {
    const shapeRule = enforce.shape(
      enforce.partial({
        username: longerThan(3),
        id: enforce.isNumber(),
      }),
    );
    expect(shapeRule.run({ username: 'foobar' }).pass).toBe(true);
  });

  it('Should fail when wrapped fields are invalid', () => {
    const shapeRule = enforce.shape(
      enforce.partial({
        username: longerThan(3),
        id: enforce.isNumber(),
      }),
    );
    // @ts-expect-error
    expect(shapeRule.run({ username: 'foo', id: '1' }).pass).toBe(false);
  });

  it("Should retain rule's original constraints", () => {
    const partialSchema = enforce.partial({
      username: longerThan(3),
      id: enforce.isNumber(),
    });
    const shapeRule = enforce.shape(partialSchema);
    const looseRule = enforce.loose(partialSchema);

    // shape is strict and fails on extra properties
    expect(
      // @ts-expect-error
      shapeRule.run({ username: 'foobar', id: 1, foo: 'bar' }).pass,
    ).toBe(false);

    // loose allows extra properties
    expect(looseRule.run({ username: 'foobar', id: 1, foo: 'bar' }).pass).toBe(
      true,
    );
  });
});
