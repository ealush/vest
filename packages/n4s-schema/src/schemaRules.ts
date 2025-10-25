import { RuleInstance } from './enforce';

export type InferShape<T> = T extends RuleInstance<infer R, any> ? R : never;

export type SchemaInfer<T extends Record<string, RuleInstance<any>>> = {
  [K in keyof T]: InferShape<T[K]>;
};

export type ShapeType<T extends Record<string, RuleInstance<any>>> =
  SchemaInfer<T>;

export function loose<T extends Record<string, RuleInstance<any>>>(
  schema: T,
  _value?: ShapeType<T> & Record<string, unknown>,
): RuleInstance<
  ShapeType<T> & Record<string, unknown>,
  [ShapeType<T> & Record<string, unknown>]
> {
  return {
    run: (v: ShapeType<T> & Record<string, unknown>) => {
      // Check that each schema field passes its rule
      for (const key in schema) {
        if (!(key in v) || !schema[key].run(v[key]).passes) {
          return { passes: false, type: v };
        }
      }
      return { passes: true, type: v };
    },
    infer: {} as ShapeType<T>,
  };
}

export function isArrayOf<T>(
  ...rules: RuleInstance<T, any>[]
): RuleInstance<T[], [T[]]> {
  return {
    run: (value: T[]) => {
      if (!Array.isArray(value)) {
        return { passes: false, type: value };
      }

      const passes = value.every(item =>
        rules.some(rule => rule.run(item).passes),
      );

      return { passes, type: value };
    },
    infer: [] as T[],
  };
}

export function optional<T>(
  rule: RuleInstance<T, any>,
): RuleInstance<T | undefined | null, [T | undefined | null]> {
  return {
    run: (value: T | undefined | null) => {
      if (value === undefined || value === null) {
        return { passes: true, type: value };
      }
      return rule.run(value);
    },
    infer: undefined as T | undefined | null,
  };
}

export function partial<T extends Record<string, RuleInstance<any>>>(
  schema: T,
): { [K in keyof T]: RuleInstance<InferShape<T[K]> | undefined | null> } {
  const result: { [key: string]: RuleInstance<any> } = {};

  for (const key in schema) {
    if (Object.prototype.hasOwnProperty.call(schema, key)) {
      result[key] = optional(schema[key]);
    }
  }

  return result as {
    [K in keyof T]: RuleInstance<InferShape<T[K]> | undefined | null>;
  };
}

export function shape<T extends Record<string, RuleInstance<any>>>(
  schema: T,
  _value?: ShapeType<T>,
): RuleInstance<ShapeType<T>, [ShapeType<T>]> {
  return {
    run: (v: ShapeType<T>) => {
      // First check loose match (all schema fields exist and pass)
      const looseResult = loose(schema).run(v);
      if (!looseResult.passes) {
        return looseResult;
      }

      // Then verify no extra fields (exact match)
      for (const key in v) {
        if (!(key in schema)) {
          return { passes: false, type: v };
        }
      }

      return { passes: true, type: v };
    },
    infer: {} as ShapeType<T>,
  };
}

export function allOf<T>(...rules: RuleInstance<T, any>[]): RuleInstance<T> {
  return {
    run: (value: T) => {
      for (const rule of rules) {
        const result = rule.run(value);
        if (!result.passes) {
          return { passes: false, type: value };
        }
      }
      return { passes: true, type: value };
    },
    infer: {} as T,
  };
}

export function anyOf<T>(...rules: RuleInstance<T, any>[]): RuleInstance<T> {
  return {
    run: (value: T) => {
      for (const rule of rules) {
        if (rule.run(value).passes) {
          return { passes: true, type: value };
        }
      }
      return { passes: false, type: value };
    },
    infer: {} as T,
  };
}

export function oneOf<T>(...rules: RuleInstance<T, any>[]): RuleInstance<T> {
  return {
    run: (value: T) => {
      let passingCount = 0;
      for (const rule of rules) {
        if (rule.run(value).passes) {
          passingCount++;
          if (passingCount > 1) {
            return { passes: false, type: value };
          }
        }
      }
      return { passes: passingCount === 1, type: value };
    },
    infer: {} as T,
  };
}

export function noneOf<T>(...rules: RuleInstance<T, any>[]): RuleInstance<T> {
  return {
    run: (value: T) => {
      for (const rule of rules) {
        if (rule.run(value).passes) {
          return { passes: false, type: value };
        }
      }
      return { passes: true, type: value };
    },
    infer: {} as T,
  };
}
