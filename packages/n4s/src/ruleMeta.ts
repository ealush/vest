export type SchemaPath = readonly (
  | string
  | { type: 'item'; binding: string }
)[];
export type Relationship = {
  source: SchemaPath;
  target: SchemaPath;
  effect: 'invalidate';
};
export type Description = { relationships: Relationship[] };

export type Scope = {
  readonly root: Scope;
  [FIELD]: (name: string) => Scope;
  [field: string]: Scope;
};

export const FIELD = Symbol('n4s.relationships.field');

export type RuleMeta = {
  kind?: string;
  children?: unknown;
  declarations: Array<(scope: Scope) => unknown>;
  chained?: boolean;
};

const rules = new WeakMap<object, RuleMeta>();
let describeImplementation: ((rule: object) => Description) | undefined;

export function meta(rule: object): RuleMeta {
  let value = rules.get(rule);
  if (!value) {
    value = { declarations: [] };
    rules.set(rule, value);
  }
  return value;
}

export function registerRule(
  rule: object,
  kind: string,
  children: unknown,
): void {
  const value = meta(rule);
  value.kind = kind;
  value.children = children;
}

/**
 * Returns a rule that behaves like `base` and adds one dependency declaration.
 * `base` is left untouched, so a rule constant reused across fields does not
 * carry one field's dependencies into the others.
 */
export function deriveDependency<T extends object>(
  base: T,
  resolver: (scope: Scope) => unknown,
): T {
  const derived: T = new Proxy(base, {
    get(target, key) {
      if (key === 'dependsOn') {
        return (next: (scope: Scope) => unknown) =>
          deriveDependency(derived, next);
      }
      const value = Reflect.get(target, key);
      if (typeof value !== 'function') return value;
      return (...args: unknown[]) => {
        const result = value.apply(target, args);
        return result === target ? derived : result;
      };
    },
  });
  // Structure stays shared with the base; only declarations differ.
  const baseMeta = meta(base);
  const derivedMeta: RuleMeta = Object.create(baseMeta);
  derivedMeta.declarations = [...baseMeta.declarations, resolver];
  rules.set(derived, derivedMeta);
  return derived;
}

export function installDescribe(
  implementation: (rule: object) => Description,
): void {
  describeImplementation = implementation;
}

export function describeRule(rule: object): Description {
  if (!describeImplementation) {
    throw new Error("describe() needs: import 'n4s/relationships'");
  }
  return describeImplementation(rule);
}
