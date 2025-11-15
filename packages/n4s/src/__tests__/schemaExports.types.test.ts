import { describe, expect, it, expectTypeOf } from 'vitest';

import {
  enforce,
  type RuleInstance,
  type SchemaInfer,
  type ShapeType,
  type LooseShapeValue,
  type PartialShapeValue,
} from 'n4s';

describe('schema type exports', () => {
  it('exposes RuleInstance type for schemas', () => {
    const rule = enforce.isString();

    expectTypeOf(rule).toMatchTypeOf<RuleInstance<string>>();
    expect(rule.test('value')).toBe(true);
  });

  it('infers data types from schema rule instances', () => {
    const schema = enforce.shape({
      name: enforce.isString(),
      age: enforce.isNumber(),
    });

    expectTypeOf(schema.infer).toEqualTypeOf<{
      name: string;
      age: number;
    }>();
  });

  it('infers data types from loose and partial schemas', () => {
    const looseSchema = enforce.loose({
      title: enforce.isString(),
    });

    const partialSchema = enforce.partial({
      id: enforce.isNumber(),
      label: enforce.isString(),
    });

    expectTypeOf(looseSchema.infer).toEqualTypeOf<{
      title: string;
    } & Record<string, unknown>>();

    expectTypeOf(partialSchema.infer).toEqualTypeOf<{
      id?: number | undefined;
      label?: string | undefined;
    }>();
  });

  it('allows importing schema helper types', () => {
    type Schema = {
      username: RuleInstance<string>;
      score: RuleInstance<number>;
    };

    type InferredViaSchemaInfer = SchemaInfer<Schema>;
    type InferredViaShapeType = ShapeType<Schema>;
    type LooseValue = LooseShapeValue<Schema>;
    type PartialValue = PartialShapeValue<Schema>;

    expectTypeOf<InferredViaSchemaInfer>().toEqualTypeOf<{
      username: string;
      score: number;
    }>();

    expectTypeOf<InferredViaShapeType>().toEqualTypeOf<{
      username: string;
      score: number;
    }>();

    expectTypeOf<LooseValue>().toEqualTypeOf<{
      username: string;
      score: number;
    } & Record<string, unknown>>();

    expectTypeOf<PartialValue>().toEqualTypeOf<{
      username?: string | undefined;
      score?: number | undefined;
    }>();
  });
});
