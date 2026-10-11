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

declare const FIELD_REFERENCE: unique symbol;
declare const DECLARED_DEPENDENCIES: unique symbol;

type FieldPath = readonly [string, ...string[]];

/**
 * A reference returned from a `dependsOn()` resolver. It carries its literal
 * path, so `enforce.shape()` can check local references against its keys.
 */
export type FieldReference<
  P extends FieldPath = FieldPath,
  Rooted extends boolean = boolean,
> = { readonly [FIELD_REFERENCE]: { path: P; rooted: Rooted } };

/**
 * The scope a `dependsOn()` resolver receives.
 *
 * - `$('name')` references a field in the shape that contains the rule, and
 *   `$('address', 'city')` a path below it. The shape checks the first
 *   segment, and deeper segments against that field's data type, at compile
 *   time.
 * - `$.root('name')` references a top-level field. Root references are
 *   checked when the graph is resolved, not by the type system.
 *
 * Any field name works, including `root`, `parent` and `then`.
 */
export type Scope = {
  <const P extends FieldPath>(...path: P): FieldReference<P, false>;
  readonly root: <const P extends FieldPath>(
    ...path: P
  ) => FieldReference<P, true>;
};

export type DependencyResolver = (
  scope: Scope,
) => FieldReference | readonly FieldReference[];

/**
 * The local paths a rule declares with `dependsOn()`, carried in its type so
 * the containing shape can check them. Rules chained after `dependsOn()`
 * return their own types without these paths, so declare `dependsOn()` last
 * to have the shape check it; `create()` checks every reference at runtime.
 */
export type DeclaredDependencies<R> = {
  readonly [DECLARED_DEPENDENCIES]?: {
    [P in LocalPath<R> as JoinPath<P>]: P;
  };
};

type LocalPath<R> = R extends FieldReference<infer P, false> ? P : never;

type JoinPath<P> = P extends readonly [
  infer H extends string,
  ...infer Rest extends string[],
]
  ? Rest extends []
    ? H
    : `${H}.${JoinPath<Rest>}`
  : never;

type DeclaredPaths<R> = R extends {
  readonly [DECLARED_DEPENDENCIES]?: infer M;
}
  ? NonNullable<M>[keyof NonNullable<M>]
  : never;

type FieldData<S> = {
  [K in keyof S]: S[K] extends { infer: infer T } ? T : unknown;
};

// A path is valid when each segment is a key of the data type at that level.
// Unions (from compound rules) accept a key of any member. Unknown data,
// arrays (numeric segments) and records stay permissive.
type InvalidPath<P, D> = P extends readonly [
  infer H extends string,
  ...infer Rest extends string[],
]
  ? unknown extends D
    ? never
    : H extends KeyOf<D>
      ? InvalidPath<Rest, NonNullable<ValueAt<D, H>>>
      : P
  : never;

type KeyOf<D> = D extends readonly unknown[]
  ? `${number}`
  : D extends object
    ? keyof D & string
    : never;

type ValueAt<D, H extends string> = D extends readonly unknown[]
  ? D[number]
  : D extends object
    ? H extends keyof D
      ? D[H]
      : never
    : never;

/**
 * Checks every field's local `dependsOn()` references against the shape's
 * own keys. A field with an unknown reference is reported on that field.
 */
export type CheckDependencies<S> = {
  [F in keyof S]: [InvalidPath<DeclaredPaths<S[F]>, FieldData<S>>] extends [
    never,
  ]
    ? S[F]
    : `"${F & string}" depends on unknown field "${JoinPath<
        InvalidPath<DeclaredPaths<S[F]>, FieldData<S>>
      >}"`;
};

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
