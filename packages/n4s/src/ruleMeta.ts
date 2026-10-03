export type SchemaPath = readonly (
  | string
  | { type: 'item'; binding: 'isArrayOf' | 'record' }
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

export type DependencyResolver = (scope: Scope) => Scope | readonly Scope[];

export const FIELD = Symbol('n4s.relationships.field');

export type RuleMeta = {
  kind?: string;
  children?: unknown;
  declarations: DependencyResolver[];
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
  resolver: DependencyResolver,
  derived: T = copyRule(base),
): T {
  const baseMeta = meta(base);
  Object.assign(derived, base);
  rules.set(derived, {
    ...baseMeta,
    declarations: [...baseMeta.declarations, resolver],
  });
  return derived;
}

function copyRule<T extends object>(base: T): T {
  const target =
    typeof base === 'function'
      ? (...args: unknown[]) => Reflect.apply(base, undefined, args)
      : {};
  return Object.assign(target, base);
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
