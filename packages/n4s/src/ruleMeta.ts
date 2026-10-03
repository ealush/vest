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
export let revision = 0;
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

export function declareDependency(
  rule: object,
  resolver: (scope: Scope) => unknown,
): void {
  meta(rule).declarations.push(resolver);
  revision++;
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
