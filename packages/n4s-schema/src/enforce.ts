// Rule exports (move to top, remove duplicates)
// Core rule instances (single definition, top of file)
const isStringRule = BuildRule(isString);
const isNumberRule = BuildRule(isNumber);
const isBooleanRule = BuildRule(isBoolean);
// --- Schema rules and functions ---

// Optional: makes a field optional in the inferred type
function optional<T>(
  rule: RuleInstance<T, any[]>,
): RuleInstance<T | undefined, any[]> {
  return BuildRule((value?: T) =>
    ruleRunReturn(value === undefined || rule.run(value).passes, value),
  );
}
export const optionalRule = optional;

// Partial: allows missing keys in the shape
function partial<T extends Record<string, RuleInstance<any>>>(
  schema: T,
): RuleInstance<Partial<ShapeType<T>>, [Record<string, any>]> {
  return BuildRule((value: Record<string, any>) => {
    const result: Partial<ShapeType<T>> = {};
    let passes = true;
    for (const key in schema) {
      if (value[key] !== undefined) {
        const res = schema[key].run(value[key]);
        result[key as keyof T] = res.type;
        passes = passes && res.passes;
      }
    }
    return ruleRunReturn(passes, result);
  });
}
export const partialRule = partial;

// Loose: allows extra keys not in the schema
function loose<T extends Record<string, RuleInstance<any>>>(
  schema: T,
): RuleInstance<ShapeType<T> & Record<string, any>, [Record<string, any>]> {
  return BuildRule((value: Record<string, any>) => {
    const result: Record<string, any> = { ...value };
    let passes = true;
    for (const key in schema) {
      const res = schema[key].run(value[key]);
      result[key] = res.type;
      passes = passes && res.passes;
    }
    return ruleRunReturn(passes, result as ShapeType<T> & Record<string, any>);
  });
}
export const looseRule = loose;

// isArrayOf: validates an array of a given rule
function isArrayOf<T>(
  rule: RuleInstance<T, any[]>,
): RuleInstance<T[], [any[]]> {
  return BuildRule((arr: any[]) => {
    const passes =
      Array.isArray(arr) && arr.every(item => rule.run(item).passes);
    const types = Array.isArray(arr)
      ? arr.map(item => rule.run(item).type)
      : [];
    return ruleRunReturn(passes, types as T[]);
  });
}
export const isArrayOfRule = isArrayOf;

// shape: already implemented as BuildShapeRule
// Example of nested composition:

const addressShape = {
  city: isStringRule,
  street: isStringRule,
  zip: isNumberRule,
};
const addressRule = BuildShapeRule(addressShape);

const userShape = {
  address: addressRule,
  age: optionalRule(isNumberRule),
  meta: looseRule({ foo: isStringRule }),
  name: isStringRule,
  preferences: partialRule({
    notifications: isBooleanRule,
    theme: isStringRule,
  }),
  tags: isArrayOfRule(isStringRule),
};
const userRule = BuildShapeRule(userShape);

type User = typeof userRule.infer;

// Example usage:
const exampleUser: User = {
  address: { city: 'NY', street: 'Main', zip: 12345 },
  meta: { foo: 'bar', extra: 42 },
  name: 'Alice',
  preferences: { theme: 'dark' },
  tags: ['admin', 'user'],
  age: undefined,
};
// --- Reimplemented rules from n4s ---

function endsWith(value: string, ending: string): RuleRunReturn<boolean> {
  return ruleRunReturn(value.endsWith(ending), value.endsWith(ending));
}
export const endsWithRule = BuildRule(endsWith);

function equals<T>(a: T, b: T): RuleRunReturn<boolean> {
  return ruleRunReturn(a === b, a === b);
}
export const equalsRule = BuildRule(equals);

function greaterThanOrEquals(a: number, b: number): RuleRunReturn<boolean> {
  return ruleRunReturn(a >= b, a >= b);
}
export const greaterThanOrEqualsRule = BuildRule(greaterThanOrEquals);

function inside<T>(value: T, arr: T[]): RuleRunReturn<boolean> {
  return ruleRunReturn(arr.includes(value), arr.includes(value));
}
export const insideRule = BuildRule(inside);

function isBetween(
  value: number,
  min: number,
  max: number,
): RuleRunReturn<boolean> {
  return ruleRunReturn(
    value >= min && value <= max,
    value >= min && value <= max,
  );
}
export const isBetweenRule = BuildRule(isBetween);

function isBlank(value: string): RuleRunReturn<boolean> {
  return ruleRunReturn(value.trim() === '', value.trim() === '');
}
export const isBlankRule = BuildRule(isBlank);

function isBoolean(value: any): RuleRunReturn<boolean> {
  return ruleRunReturn(typeof value === 'boolean', typeof value === 'boolean');
}

function isEven(value: number): RuleRunReturn<boolean> {
  return ruleRunReturn(value % 2 === 0, value % 2 === 0);
}
export const isEvenRule = BuildRule(isEven);

function isKeyOf<T extends object>(
  key: string,
  obj: T,
): RuleRunReturn<boolean> {
  return ruleRunReturn(key in obj, key in obj);
}
export const isKeyOfRule = BuildRule(isKeyOf);

function isNaN(value: any): RuleRunReturn<boolean> {
  return ruleRunReturn(Number.isNaN(value), Number.isNaN(value));
}
export const isNaNRule = BuildRule(isNaN);

function isNegative(value: number): RuleRunReturn<boolean> {
  return ruleRunReturn(value < 0, value < 0);
}
export const isNegativeRule = BuildRule(isNegative);

function isNumber(value: any): RuleRunReturn<number> {
  return ruleRunReturn(typeof value === 'number', value);
}

function isOdd(value: number): RuleRunReturn<boolean> {
  return ruleRunReturn(value % 2 !== 0, value % 2 !== 0);
}
export const isOddRule = BuildRule(isOdd);

function isTruthy(value: any): RuleRunReturn<boolean> {
  return ruleRunReturn(!!value, !!value);
}
export const isTruthyRule = BuildRule(isTruthy);

function isValueOf<T>(
  value: T,
  obj: Record<string, T>,
): RuleRunReturn<boolean> {
  return ruleRunReturn(
    Object.values(obj).includes(value),
    Object.values(obj).includes(value),
  );
}
export const isValueOfRule = BuildRule(isValueOf);

function lessThan(a: number, b: number): RuleRunReturn<boolean> {
  return ruleRunReturn(a < b, a < b);
}
export const lessThanRule = BuildRule(lessThan);

function lessThanOrEquals(a: number, b: number): RuleRunReturn<boolean> {
  return ruleRunReturn(a <= b, a <= b);
}
export const lessThanOrEqualsRule = BuildRule(lessThanOrEquals);

function longerThanOrEquals(a: string, b: number): RuleRunReturn<boolean> {
  return ruleRunReturn(a.length >= b, a.length >= b);
}
export const longerThanOrEqualsRule = BuildRule(longerThanOrEquals);

function matches(value: string, regex: RegExp): RuleRunReturn<boolean> {
  return ruleRunReturn(regex.test(value), regex.test(value));
}
export const matchesRule = BuildRule(matches);

function ruleCondition(condition: boolean): RuleRunReturn<boolean> {
  return ruleRunReturn(condition, condition);
}
export const ruleConditionRule = BuildRule(ruleCondition);

function shorterThan(a: string, b: number): RuleRunReturn<boolean> {
  return ruleRunReturn(a.length < b, a.length < b);
}
export const shorterThanRule = BuildRule(shorterThan);

function shorterThanOrEquals(a: string, b: number): RuleRunReturn<boolean> {
  return ruleRunReturn(a.length <= b, a.length <= b);
}
export const shorterThanOrEqualsRule = BuildRule(shorterThanOrEquals);

function startsWith(value: string, start: string): RuleRunReturn<boolean> {
  return ruleRunReturn(value.startsWith(start), value.startsWith(start));
}
export const startsWithRule = BuildRule(startsWith);
interface RuleRunReturn<T> {
  passes: boolean;
  type: T;
}

type RuleInstance<T, Args extends any[] = any[]> = {
  run: (...args: Args) => RuleRunReturn<T>;
  infer: T;
};

type ShapeType<T extends Record<string, RuleInstance<any>>> = {
  [K in keyof T]: T[K] extends RuleInstance<infer U, any[]> ? U : never;
};

function BuildRule<T, Args extends any[]>(
  rule: (...args: Args) => RuleRunReturn<T>,
): RuleInstance<T, Args> {
  return {
    run: (...args: Args) => rule(...args),
    infer: undefined as unknown as T,
  };
}

function BuildShapeRule<T extends Record<string, RuleInstance<any>>>(
  schema: T,
): RuleInstance<ShapeType<T>, [Record<string, any>]> {
  return {
    run: (value: Record<string, any>) => shape(value, schema),
    infer: undefined as unknown as ShapeType<T>,
  };
}

function ruleRunReturn<T>(passes: boolean, type: T): RuleRunReturn<T> {
  return {
    passes,
    type,
  };
}

function isString(value: any): RuleRunReturn<string> {
  return ruleRunReturn(typeof value === 'string', '');
}

function shape<T extends Record<string, RuleInstance<any>>>(
  value: Record<string, any>,
  schema: T,
): RuleRunReturn<ShapeType<T>> {
  const passes = Object.keys(schema).every(key => {
    return schema[key].run(value[key]).passes;
  });

  const newShape = {} as ShapeType<T>;
  for (const key in schema) {
    newShape[key as keyof T] = schema[key].run(value[key]).type;
  }
  return ruleRunReturn(passes, newShape);
}

// Remove duplicate Person type

// --- Improved person schema with examples ---

const personShape = {
  age: isNumberRule,
  email: isStringRule,
  isActive: isBooleanRule,
  name: isStringRule,
  score: isNumberRule,
  status: BuildRule(
    (value: 'active' | 'inactive'): RuleRunReturn<'active' | 'inactive'> =>
      ruleRunReturn(value === 'active' || value === 'inactive', value),
  ),
  tags: isArrayOfRule(isStringRule),
};

const person = BuildShapeRule(personShape);

type Person = typeof person.infer;

// Example usages

// Removed unused validPerson variable

// const result = person.run(validPerson);
// console.log('Validation result:', result);

// Example: Type error if wrong type
// const invalidPerson: Person = {
//   name: 123, // Error: should be string
//   age: 'thirty', // Error: should be number
//   isActive: 'yes', // Error: should be boolean
//   tags: [1, 2], // Error: should be string[]
//   score: 'high', // Error: should be number
//   email: 12345, // Error: should be string
//   status: 42, // Error: should be 'active' | 'inactive'
// };
