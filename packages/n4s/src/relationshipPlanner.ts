import { childrenOf, describeSchema } from './relationshipGraph';
import { meta, type RuleMeta, type SchemaPath } from './ruleMeta';

export type ConcretePath = readonly (string | number)[];

type Edge = { source: SchemaPath; target: SchemaPath };
type Index = Map<string, Edge[]>;
// Graphs are immutable, so each schema's reverse index is built once.
const indexes = new WeakMap<object, Index>();
const unsafe = new Set(['__proto__', 'constructor', 'prototype']);

/** Plan one hop of invalidation without running rules or reading data getters. */
export function resolveAffected(
  schema: object,
  changed: readonly string[],
  data: unknown,
): ConcretePath[] {
  const index = reverseIndex(schema);
  const selected = new Map<string, ConcretePath>();
  const affected = new Map<string, ConcretePath>();

  function add(path: ConcretePath, pattern: SchemaPath): void {
    const key = JSON.stringify(path);
    if (selected.has(key)) return;
    selected.set(key, path);
    affected.set(key, path);
    const bindings = bindingsFor(pattern, path);
    for (const edge of index.get(JSON.stringify(pattern)) ?? []) {
      instantiate(edge.target, data, bindings, target => {
        affected.set(JSON.stringify(target), target);
      });
    }
  }

  for (const name of changed) {
    const segments = parseName(name);
    if (!segments) continue;
    select(schema, segments, data, add);
  }
  return [...affected.values()];
}

function reverseIndex(schema: object): Index {
  let edges = indexes.get(schema);
  if (!edges) {
    edges = new Map();
    for (const edge of describeSchema(schema).relationships) {
      const key = JSON.stringify(edge.source);
      const list = edges.get(key) ?? [];
      list.push(edge);
      edges.set(key, list);
    }
    indexes.set(schema, edges);
  }
  return edges;
}

function parseName(name: string): string[] | undefined {
  if (!name || typeof name !== 'string') return undefined;
  const normalized = name.replace(/\[(\d+)\]/g, '.$1');
  if (/[\[\]]/.test(normalized)) return undefined;
  const parts = normalized.split('.');
  if (parts.some(part => !part || unsafe.has(part))) return undefined;
  return parts;
}

type Add = (path: ConcretePath, pattern: SchemaPath) => void;
type Node = {
  rule: unknown;
  offset: number;
  path: ConcretePath;
  pattern: SchemaPath;
  value: unknown;
};

function select(
  root: object,
  segments: string[],
  data: unknown,
  add: Add,
): void {
  // A rule may recur through lazy(), but only after consuming a segment.
  const ancestors = segments.map(() => new Set<object>());
  ancestors.push(new Set<object>());

  function visit({ rule, offset, path, pattern, value }: Node): void {
    const seen = ancestors[offset];
    if (!tryEnter(seen, rule)) return;
    if (offset === segments.length) {
      expand(rule, path, pattern, value, { add, values: new Set() }, seen);
    } else {
      const info = meta(rule);
      for (const [child, childPattern] of childrenOf(
        info.kind,
        info.children,
        pattern,
      )) {
        const next = matchChild(
          { rule: child, offset, path, pattern: childPattern, value },
          pattern.length,
          info.kind,
          segments,
        );
        if (next) visit(next);
      }
    }
    seen.delete(rule);
  }

  visit({ rule: root, offset: 0, path: [], pattern: [], value: data });
}

function matchChild(
  node: Node,
  parentLength: number,
  kind: string | undefined,
  segments: string[],
): Node | undefined {
  const tail = node.pattern.slice(parentLength);
  if (!tail.length) return node;
  if (typeof tail[0] === 'string') {
    const key = tail[0];
    const parts = key.split('.');
    if (!parts.every((part, i) => segments[node.offset + i] === part)) return;
    return {
      ...node,
      offset: node.offset + parts.length,
      path: [...node.path, concreteKey(key, tupleBinding(kind))],
      value: ownValue(node.value, key),
    };
  }
  const key = segments[node.offset];
  if (!itemKeys(node.value, tail[0].binding).includes(key)) return;
  return {
    ...node,
    offset: node.offset + 1,
    path: [...node.path, concreteKey(key, tail[0].binding)],
    value: ownValue(node.value, key),
  };
}

type Expansion = { add: Add; values: Set<object> };
type Parent = {
  kind: string | undefined;
  path: ConcretePath;
  pattern: SchemaPath;
  value: unknown;
};

function expand(
  rule: object,
  path: ConcretePath,
  pattern: SchemaPath,
  value: unknown,
  walk: Expansion,
  ancestors: Set<object>,
): void {
  walk.add(path, pattern);
  const info = meta(rule);
  if (info.kind === 'lazy') {
    expandLazy(info, { kind: info.kind, path, pattern, value }, walk);
    return;
  }
  const parent = { kind: info.kind, path, pattern, value };
  for (const [child, childPattern] of childrenOf(
    info.kind,
    info.children,
    pattern,
  )) {
    if (!tryEnter(ancestors, child)) continue;
    expandChild(child, childPattern, parent, walk, ancestors);
    ancestors.delete(child);
  }
}

function expandChild(
  child: object,
  childPattern: SchemaPath,
  parent: Parent,
  walk: Expansion,
  ancestors: Set<object>,
): void {
  const tail = childPattern.slice(parent.pattern.length);
  for (const key of expansionKeys(tail, parent.value)) {
    const nextPath = pathWithKey(parent.path, key, tail[0], parent.kind);
    const nextValue =
      key === undefined ? parent.value : ownValue(parent.value, key);
    expand(child, nextPath, childPattern, nextValue, walk, ancestors);
  }
}

/** Recursion through lazy() is bounded by the data rather than the schema. */
function expandLazy(info: RuleMeta, parent: Parent, walk: Expansion): void {
  const { path, pattern, value } = parent;
  if (!isNode(value) || walk.values.has(value)) return;
  const [[child]] = childrenOf(info.kind, info.children, pattern);
  if (!isNode(child)) return;
  walk.values.add(value);
  expand(child, path, pattern, value, walk, new Set([child]));
  walk.values.delete(value);
}

function expansionKeys(
  tail: SchemaPath,
  value: unknown,
): Array<string | undefined> {
  if (!tail.length) return [undefined];
  return typeof tail[0] === 'string'
    ? [tail[0]]
    : itemKeys(value, tail[0].binding);
}

function pathWithKey(
  path: ConcretePath,
  key: string | undefined,
  segment: SchemaPath[number],
  kind: string | undefined,
): ConcretePath {
  if (key === undefined) return path;
  const binding =
    typeof segment === 'string'
      ? kind === 'tuple'
        ? 'isArrayOf'
        : ''
      : segment.binding;
  return [...path, concreteKey(key, binding)];
}

function tupleBinding(kind: string | undefined): string {
  return kind === 'tuple' ? 'isArrayOf' : '';
}

function tryEnter(ancestors: Set<object>, rule: unknown): rule is object {
  if (!isNode(rule) || ancestors.has(rule)) return false;
  ancestors.add(rule);
  return true;
}

function bindingsFor(
  pattern: SchemaPath,
  path: ConcretePath,
): Map<string, string | number> {
  const bindings = new Map<string, string | number>();
  for (let i = 0; i < pattern.length; i++) {
    if (typeof pattern[i] !== 'string') {
      bindings.set(JSON.stringify(pattern.slice(0, i + 1)), path[i]);
    }
  }
  return bindings;
}

function instantiate(
  pattern: SchemaPath,
  data: unknown,
  bindings: Map<string, string | number>,
  add: (path: ConcretePath) => void,
): void {
  function visit(offset: number, path: ConcretePath, value: unknown): void {
    if (offset === pattern.length) {
      add(path);
      return;
    }
    const segment = pattern[offset];
    if (typeof segment === 'string') {
      visit(offset + 1, [...path, segment], ownValue(value, segment));
    } else {
      const bound = bindings.get(JSON.stringify(pattern.slice(0, offset + 1)));
      const keys =
        bound === undefined ? itemKeys(value, segment.binding) : [bound];
      for (const key of keys) {
        visit(
          offset + 1,
          [...path, concreteKey(key, segment.binding)],
          ownValue(value, String(key)),
        );
      }
    }
  }
  visit(0, [], data);
}

function itemKeys(value: unknown, kind: string): string[] {
  if (kind === 'isArrayOf') {
    return Array.isArray(value)
      ? Array.from({ length: value.length }, (_, i) => String(i))
      : [];
  }
  return isNode(value) && !Array.isArray(value)
    ? Object.keys(value).filter(key => !unsafe.has(key))
    : [];
}

function concreteKey(key: string | number, kind: string): string | number {
  return kind === 'isArrayOf' ? Number(key) : key;
}

function ownValue(value: unknown, key: string): unknown {
  return isNode(value)
    ? Object.getOwnPropertyDescriptor(value, key)?.value
    : undefined;
}

function isNode(value: unknown): value is object {
  return (
    (typeof value === 'object' && value !== null) || typeof value === 'function'
  );
}
