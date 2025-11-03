import { RuleInstance, Passing, Failing } from 'enforceUtil';

export type InferShape<T> = T extends RuleInstance<infer R, any> ? R : never;

export type SchemaInfer<T extends Record<string, RuleInstance<any>>> = {
  [K in keyof T as undefined extends InferShape<T[K]> ? never : K]: InferShape<
    T[K]
  >;
} & {
  [K in keyof T as undefined extends InferShape<T[K]> ? K : never]?: InferShape<
    T[K]
  >;
};

export type ShapeType<T extends Record<string, RuleInstance<any>>> =
  SchemaInfer<T>;

type MultiTypeInput<T extends RuleInstance<any, any>[]> =
  InferShape<T[number]> extends never ? unknown : InferShape<T[number]>;

export function loose<T extends Record<string, RuleInstance<any>>>(
  schema: T,
  _value?: ShapeType<T> & Record<string, unknown>,
): RuleInstance<
  ShapeType<T> & Record<string, unknown>,
  [ShapeType<T> & Record<string, unknown>]
> {
  return {
    run: (v: ShapeType<T> & Record<string, unknown>) => {
      // Check that each schema field pass its rule
      for (const key in schema) {
        const value = key in v ? v[key] : undefined;
        if (!schema[key].run(value).pass) {
          return Failing(v);
        }
      }
      return Passing(v);
    },
    infer: {} as ShapeType<T>,
  };
}

export function isArrayOf<T extends RuleInstance<any, any>[]>(
  ...rules: T
): RuleInstance<MultiTypeInput<T>[], [MultiTypeInput<T>[]]> {
  return {
    run: (value: MultiTypeInput<T>[]) => {
      if (!Array.isArray(value)) {
        return Failing(value);
      }

      const pass = value.every(item =>
        (rules as RuleInstance<any, any>[]).some(
          rule => rule.run(item as any).pass,
        ),
      );

      return pass ? Passing(value) : Failing(value);
    },
    infer: [] as MultiTypeInput<T>[],
  };
}

export function optional<T>(
  rule: RuleInstance<T, any>,
): RuleInstance<T | undefined | null, [T | undefined | null]> {
  return {
    run: (value: T | undefined | null) => {
      if (value === undefined || value === null) {
        return Passing(value);
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
      if (!looseResult.pass) {
        return looseResult;
      }

      // Then verify no extra fields (exact match)
      for (const key in v) {
        if (!(key in schema)) {
          return Failing(v);
        }
      }

      return Passing(v);
    },
    infer: {} as ShapeType<T>,
  };
}

export function allOf<T>(...rules: RuleInstance<T, any>[]): RuleInstance<T> {
  return {
    run: (value: T) => {
      for (const rule of rules) {
        const result = rule.run(value);
        if (!result.pass) {
          return Failing(value);
        }
      }
      return Passing(value);
    },
    infer: {} as T,
  };
}

export function anyOf<T extends RuleInstance<any, any>[]>(
  ...rules: T
): RuleInstance<MultiTypeInput<T>, [MultiTypeInput<T>]> {
  return {
    run: (value: MultiTypeInput<T>) => {
      for (const rule of rules) {
        if (rule.run(value as any).pass) {
          return Passing(value);
        }
      }
      return Failing(value);
    },
    infer: {} as MultiTypeInput<T>,
  };
}

export function oneOf<T extends RuleInstance<any, any>[]>(
  ...rules: T
): RuleInstance<MultiTypeInput<T>> {
  return {
    run: (value: MultiTypeInput<T>) => {
      let passingCount = 0;
      for (const rule of rules as RuleInstance<any, any>[]) {
        if (rule.run(value as any).pass) {
          passingCount++;
          if (passingCount > 1) {
            return Failing(value as any);
          }
        }
      }
      return passingCount === 1 ? Passing(value as any) : Failing(value as any);
    },
    infer: {} as MultiTypeInput<T>,
  };
}

export function noneOf<T>(...rules: RuleInstance<T, any>[]): RuleInstance<T> {
  return {
    run: (value: T) => {
      for (const rule of rules) {
        if (rule.run(value).pass) {
          return Failing(value);
        }
      }
      return Passing(value);
    },
    infer: {} as T,
  };
}
