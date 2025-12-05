import { describe, expect, it } from 'vitest';

import { enforce } from '../../n4s';

// This test suite verifies that compound and schema rule types are properly defined
// and can be used for type inference via the .infer property

describe('Compound and Schema Rule Types', () => {
  it('should properly type allOf rules', () => {
    const rule = enforce.allOf(
      enforce.isNumber(),
      enforce.isNumber().greaterThan(0),
    );
    type InferredType = typeof rule.infer;

    const value: InferredType = 5;
    void value;

    // Type test: string is not assignable to number
    const badValue: InferredType = 'test';
    void badValue;

    expect(rule.run(5).pass).toBe(true);
    expect(rule.run(-1).pass).toBe(false);
  });

  it('should properly type anyOf rules', () => {
    const rule = enforce.anyOf(enforce.isString(), enforce.isNumber());
    type InferredType = typeof rule.infer;

    const str: InferredType = 'test';
    const num: InferredType = 123;
    void str;
    void num;

    // Type test: boolean is not string | number
    // @ts-expect-error - boolean is not string | number
    const badValue: InferredType = true;
    void badValue;

    expect(rule.run('test').pass).toBe(true);
    expect(rule.run(123).pass).toBe(true);
    // @ts-expect-error - boolean is not string | number
    expect(rule.run(true).pass).toBe(false);
  });

  it('should properly type noneOf rules', () => {
    const rule = enforce.noneOf(enforce.isString());
    type InferredType = typeof rule.infer;

    const value: InferredType = 'test';
    void value;

    expect(rule.run(123).pass).toBe(true);
    expect(rule.run('test').pass).toBe(false);
  });

  it('should properly type oneOf rules', () => {
    const rule = enforce.oneOf(
      enforce.isString(),
      enforce.isNumber(),
      enforce.isBoolean(),
    );
    type InferredType = typeof rule.infer;

    const str: InferredType = 'test';
    const num: InferredType = 123;
    const bool: InferredType = true;
    void str;
    void num;
    void bool;

    expect(rule.run('test').pass).toBe(true);
    expect(rule.run(123).pass).toBe(true);
  });

  it('should properly type optional rules', () => {
    const rule = enforce.optional(enforce.isString());
    type InferredType = typeof rule.infer;

    const str: InferredType = 'test';
    const undef: InferredType = undefined;
    const nul: InferredType = null;
    void str;
    void undef;
    void nul;

    // Type test: number is not string | undefined | null
    // @ts-expect-error - number is not string | undefined | null
    const badValue: InferredType = 123;
    void badValue;

    expect(rule.run('test').pass).toBe(true);
    expect(rule.run(undefined).pass).toBe(true);
    expect(rule.run(null).pass).toBe(true);
    // @ts-expect-error - number is not string | undefined | null
    expect(rule.run(123).pass).toBe(false);
  });

  it('should properly type isArrayOf rules', () => {
    const rule = enforce.isArrayOf(enforce.isString());
    type InferredType = typeof rule.infer;

    const arr: InferredType = ['a', 'b', 'c'];
    void arr;

    // Type test: number[] is not string[]
    const badArr: InferredType = [1, 2, 3];
    void badArr;

    expect(rule.run(['a', 'b']).pass).toBe(true);
    expect(rule.run([1, 2]).pass).toBe(false);
  });

  it('should properly type shape rules', () => {
    const rule = enforce.shape({
      name: enforce.isString(),
      age: enforce.isNumber(),
    });
    type InferredType = typeof rule.infer;

    const obj: InferredType = { name: 'John', age: 30 };
    void obj;

    // Type test: age must be number
    // @ts-expect-error - age must be number
    const badObj: InferredType = { name: 'John', age: 'thirty' };
    void badObj;

    expect(rule.run({ name: 'John', age: 30 }).pass).toBe(true);
    // @ts-expect-error - age must be number
    expect(rule.run({ name: 'John', age: 'thirty' }).pass).toBe(false);
  });

  it('should properly type loose rules', () => {
    const rule = enforce.loose({
      name: enforce.isString(),
    });
    type InferredType = typeof rule.infer;

    const obj: InferredType = { name: 'John', extraProp: true };
    void obj;

    expect(rule.run({ name: 'John', extraProp: true }).pass).toBe(true);
  });

  it('should properly type partial rules', () => {
    const rule = enforce.partial({
      name: enforce.isString(),
      age: enforce.isNumber(),
    });
    type InferredType = typeof rule.infer;

    const obj1: InferredType = { name: 'John' };
    const obj2: InferredType = { age: 30 };
    const obj3: InferredType = {};
    void obj1;
    void obj2;
    void obj3;

    expect(rule.run({ name: 'John' }).pass).toBe(true);
    expect(rule.run({ age: 30 }).pass).toBe(true);
    expect(rule.run({}).pass).toBe(true);
  });

  it('should work with complex nested compositions', () => {
    const userRule = enforce.shape({
      id: enforce.isNumber(),
      profile: enforce.shape({
        name: enforce.isString(),
        email: enforce.optional(enforce.isString()),
      }),
      tags: enforce.optional(enforce.isArrayOf(enforce.isString())),
    });

    type User = typeof userRule.infer;

    const validUser: User = {
      id: 1,
      profile: {
        name: 'John',
        email: 'john@example.com',
      },
      tags: ['developer', 'admin'],
    };
    void validUser;

    expect(
      userRule.run({
        id: 1,
        profile: {
          name: 'John',
          email: 'john@example.com',
        },
        tags: ['developer', 'admin'],
      }).pass,
    ).toBe(true);
  });
});
