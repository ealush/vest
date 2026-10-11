/**
 * A structural, JSON-serializable location in a schema.
 *
 * - A string is a property key: a shape key or a tuple position (`'0'`).
 * - An item segment stands for every member of a collection. `binding` names
 *   the collection kind: `isArrayOf` members have numeric indexes, `record`
 *   members have string keys.
 *
 * Item identity is positional: when a source and a target share the same
 * path up to and including an item segment, they refer to the same member.
 * `['rows', item, 'country'] → ['rows', item, 'state']` relates each row's
 * country to the state of that same row.
 */
export type SchemaPath = readonly (
  | string
  | { type: 'item'; binding: 'isArrayOf' | 'record' }
)[];

/**
 * A directed edge of the relationship graph: when the value at `source`
 * changes, the current validation result at `target` may be stale.
 * `invalidate` is the only effect today; other effects can join the same
 * graph later.
 */
export type Relationship = {
  source: SchemaPath;
  target: SchemaPath;
  effect: 'invalidate';
};

/** The relationship graph of a schema, as returned by `schema.describe()`. */
export type Description = { relationships: Relationship[] };

/**
 * Field references for a `dependsOn()` resolver, scoped to the shape that
 * contains the field. References are checked when the graph is resolved,
 * not by the type system: an unknown field throws an `EnforceSchemaError`.
 */
export type Scope = {
  readonly root: Scope;
  /** Unsupported: use `$.root` or `$[FIELD]('parent')` for a field named parent. */
  readonly parent: never;
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
