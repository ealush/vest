import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';
import { RuleInstance } from 'enforceUtil';

const longerThan = (n: number): RuleInstance<string> => ({
  run: (v: any) => ({ pass: typeof v === 'string' && v.length > n, type: v }),
  infer: {} as string,
});

describe('partial', () => {
  const schema = {
    name: enforceLazy.isString(),
    age: enforceLazy.isNumber(),
  };

  it('should return a schema with optional rules', () => {
    const partialSchema = enforceLazy.partial(schema);
    expect(partialSchema.name).toHaveProperty('run');
    expect(partialSchema.age).toHaveProperty('run');

    // Test if they are actually optional
    expect(partialSchema.name.run(undefined).pass).toBe(true);
    expect(partialSchema.age.run(undefined).pass).toBe(true);
  });

  it('should work with shape to validate partial objects', () => {
    const partialSchema = enforceLazy.partial(schema);
    const shapeRule = enforceLazy.shape(partialSchema);

    expect(shapeRule.run({ name: 'John' }).pass).toBe(true);
    expect(shapeRule.run({ age: 30 }).pass).toBe(true);
    expect(shapeRule.run({}).pass).toBe(true);
    expect(shapeRule.run({ name: 'John', age: 30 }).pass).toBe(true);
  });

  it('should fail if a property has wrong type', () => {
    const partialSchema = enforceLazy.partial(schema);
    const shapeRule = enforceLazy.shape(partialSchema);

    // @ts-expect-error
    expect(shapeRule.run({ name: 123 }).pass).toBe(false);
    // @ts-expect-error
    expect(shapeRule.run({ age: '30' }).pass).toBe(false);
    // @ts-expect-error
    expect(shapeRule.run({ name: 'John', age: '30' }).pass).toBe(false);
  });

  it('Should pass when wrapped fields are undefined or null', () => {
    const shapeRule = enforceLazy.shape(
      enforceLazy.partial({
        username: longerThan(3),
        id: enforceLazy.isNumber(),
      }),
    );

    expect(shapeRule.run({}).pass).toBe(true);
    expect(shapeRule.run({ username: undefined, id: null }).pass).toBe(true);
  });

  it('Should pass when wrapped fields are valid', () => {
    const shapeRule = enforceLazy.shape(
      enforceLazy.partial({
        username: longerThan(3),
        id: enforceLazy.isNumber(),
      }),
    );
    expect(shapeRule.run({ username: 'foobar', id: 1 }).pass).toBe(true);
  });

  it('Should pass when some wrapped fields are missing', () => {
    const shapeRule = enforceLazy.shape(
      enforceLazy.partial({
        username: longerThan(3),
        id: enforceLazy.isNumber(),
      }),
    );
    expect(shapeRule.run({ username: 'foobar' }).pass).toBe(true);
  });

  it('Should fail when wrapped fields are invalid', () => {
    const shapeRule = enforceLazy.shape(
      enforceLazy.partial({
        username: longerThan(3),
        id: enforceLazy.isNumber(),
      }),
    );
    // @ts-expect-error
    expect(shapeRule.run({ username: 'foo', id: '1' }).pass).toBe(false);
  });

  it("Should retain rule's original constraints", () => {
    const partialSchema = enforceLazy.partial({
      username: longerThan(3),
      id: enforceLazy.isNumber(),
    });
    const shapeRule = enforceLazy.shape(partialSchema);
    const looseRule = enforceLazy.loose(partialSchema);

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
