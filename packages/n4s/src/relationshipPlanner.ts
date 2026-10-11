import { asArray, isArray, isStringValue, isUnsafeKey } from 'vest-utils';

import { childrenOf, describeSchema, isNode } from './relationshipGraph';
import { meta, type RuleMeta, type SchemaPath } from './ruleMeta';

export type ConcretePath = readonly (string | number)[];

type Edge = {
  source: SchemaPath;
  target: SchemaPath;
  concrete?: readonly string[];
};
type Index = Map<string, Edge[]>;
// Graphs are immutable, so each schema's reverse index is built once.
const indexes = new WeakMap<object, Index>();
// Only scalar schema fields with entirely static targets are cached. Dynamic
// item paths always expand against this run's data, and returned paths are fresh.
const scalarSelections = new WeakMap<object, Map<string, ConcretePath[]>>();

/**
 * Plan one hop of invalidation without running rules or reading data getters.
 * Array items are numeric path segments; tuple positions, like shape keys, are
 * static schema segments and stay strings, as in `describe()`.
 */
export function resolveAffected(
  schema: object,
  fields: string | readonly string[],
  data: unknown,
): ConcretePath[] {
  // Like suite.changed(), a single name is accepted on its own.
  const changed: readonly string[] = asArray(fields);
  const index = reverseIndex(schema);
  const cached = scalarSelection(schema, changed, index, data);
  if (cached) return cached;
  return expandSelection(schema, changed, data, index);
}

function expandSelection(
  schema: object,
  changed: readonly string[],
  data: unknown,
  index: Index,
): ConcretePath[] {
  const selected = new Map<string, ConcretePath>();
  const affected = new Map<string, ConcretePath>();
  const plan: Plan = {
    data,
    expanded: new Set(),
    include: path => void affected.set(JSON.stringify(path), path),
    index,
  };

  function add(path: ConcretePath, pattern: SchemaPath): void {
    const key = JSON.stringify(path);
    if (selected.has(key)) return;
    selected.set(key, path);
    affected.set(key, path);
    invalidateSources(pattern, path, plan);
  }

  for (const name of changed) {
    const segments = parseName(name);
    if (!segments) continue;
    if (segments.length === 1 && isScalarRootField(schema, segments[0])) {
      add(segments, segments);
    } else {
      select(schema, segments, data, add);
    }
  }
  return [...affected.values()];
}

type Plan = {
  data: unknown;
  /**
   * Every descendant of a selected container shares its ancestors' edges.
   * Each (source, bindings) pair is instantiated once per plan instead of
   * re-expanding the same fan-out for each of the container's members.
   */
  expanded: Set<string>;
  include: (path: ConcretePath) => void;
  index: Index;
};

function invalidateSources(
  pattern: SchemaPath,
  path: ConcretePath,
  plan: Plan,
): void {
  const keys = prefixKeys(pattern);
  for (let length = 1; length <= pattern.length; length++) {
    const edges = plan.index.get(keys[length - 1]);
    if (edges) {
      instantiateEdges(edges, bindingsFor(pattern, keys, length, path), plan);
    }
  }
}

function instantiateEdges(
  edges: Edge[],
  bindings: Map<string, string | number>,
  { data, expanded, include }: Plan,
): void {
  const key = `${patternKey(edges[0].source)}|${JSON.stringify([...bindings.values()])}`;
  if (expanded.has(key)) return;
  expanded.add(key);
  for (const edge of edges) {
    if (edge.concrete) include([...edge.concrete]);
    else instantiate(edge.target, data, bindings, include);
  }
}

function scalarSelection(
  schema: object,
  changed: readonly string[],
  index: Index,
  data: unknown,
): ConcretePath[] | undefined {
  if (changed.length !== 1) return;
  const segments = parseName(changed[0]);
  if (!isScalarSelection(schema, segments)) return;
  const name = segments[0];
  const selections = scalarSelectionsFor(schema);
  const paths = selections.get(name) ?? staticPaths(name, index);
  if (!paths) return singleDynamicTarget(name, index, data);
  selections.set(name, paths);
  return paths.map(path => [...path]);
}

// One item pattern cannot produce duplicate concrete paths. Avoid serializing
// an entire fan-out just to deduplicate it; expand anew for each input.
function singleDynamicTarget(
  name: string,
  index: Index,
  data: unknown,
): ConcretePath[] | undefined {
  const edges = index.get(patternKey([name]));
  if (edges?.length !== 1) return;
  const paths: ConcretePath[] = [[name]];
  instantiate(edges[0].target, data, new Map(), path => paths.push(path));
  return paths;
}

function scalarSelectionsFor(schema: object): Map<string, ConcretePath[]> {
  let selections = scalarSelections.get(schema);
  if (!selections) {
    selections = new Map();
    scalarSelections.set(schema, selections);
  }
  return selections;
}

function isScalarSelection(
  schema: object,
  segments: string[] | undefined,
): segments is [string] {
  return (
    !!segments &&
    segments.length === 1 &&
    isScalarRootField(schema, segments[0])
  );
}

function staticPaths(name: string, index: Index): ConcretePath[] | undefined {
  const edges = index.get(patternKey([name])) ?? [];
  if (edges.some(edge => !edge.concrete)) return;
  return [[name], ...edges.map(edge => edge.concrete!)];
}

function isScalarRootField(schema: object, name: string): boolean {
  const fields = staticRootFields(schema);
  const descriptor = fields && Object.getOwnPropertyDescriptor(fields, name);
  if (!descriptor?.enumerable) return false;
  return isNode(descriptor.value) && !meta(descriptor.value).kind;
}

function staticRootFields(schema: object): object | undefined {
  const info = meta(schema);
  if (info.kind !== 'shape' && info.kind !== 'loose') return undefined;
  const fields = (info.children as unknown[])?.[0];
  return isNode(fields) ? fields : undefined;
}

function reverseIndex(schema: object): Index {
  let edges = indexes.get(schema);
  if (!edges) {
    edges = new Map();
    for (const edge of describeSchema(schema).relationships) {
      const key = patternKey(edge.source);
      const list = edges.get(key) ?? [];
      list.push({ ...edge, concrete: concreteTarget(edge.target) });
      edges.set(key, list);
    }
    indexes.set(schema, edges);
  }
  return edges;
}

function concreteTarget(path: SchemaPath): readonly string[] | undefined {
  return path.every(isStringValue) ? (path as readonly string[]) : undefined;
}

function parseName(name: string): string[] | undefined {
  if (!isStringValue(name) || !name) return undefined;
  const normalized = name.replace(/\[(\d+)\]/g, '.$1');
  if (/[\[\]]/.test(normalized)) return undefined;
  const parts = normalized.split('.');
  if (parts.some(part => !part || isUnsafeKey(part))) return undefined;
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
  segments: string[],
): Node | undefined {
  const tail = node.pattern.slice(parentLength);
  if (!tail.length) return node;
  if (isStringValue(tail[0])) {
    const key = tail[0];
    const parts = key.split('.');
    if (!parts.every((part, i) => segments[node.offset + i] === part)) return;
    return {
      ...node,
      offset: node.offset + parts.length,
      path: [...node.path, key],
      value: ownValue(node.value, key),
    };
  }
  const key = segments[node.offset];
  if (!hasItemKey(node.value, tail[0].binding, key)) return;
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
    expandLazy(
      info,
      { kind: info.kind, path, pattern, value },
      walk,
      ancestors,
    );
    return;
  }
  const parent = { kind: info.kind, path, pattern, value };
  for (const [child, childPattern] of patternChildren(info, pattern)) {
    if (!tryEnter(ancestors, child)) continue;
    expandChild(child, childPattern, parent, walk, ancestors);
    ancestors.delete(child);
  }
}

// Every member of a collection shares its pattern, so its children's
// patterns are built once and reused. Stable patterns also let prefixKeys()
// reuse their keys.
const childPatterns = new WeakMap<
  SchemaPath,
  WeakMap<RuleMeta, Array<[unknown, SchemaPath]>>
>();

function patternChildren(
  info: RuleMeta,
  pattern: SchemaPath,
): Array<[unknown, SchemaPath]> {
  let byRule = childPatterns.get(pattern);
  if (!byRule) {
    byRule = new WeakMap();
    childPatterns.set(pattern, byRule);
  }
  let children = byRule.get(info);
  if (!children) {
    children = childrenOf(info.kind, info.children, pattern);
    byRule.set(info, children);
  }
  return children;
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
    const nextPath = pathWithKey(parent.path, key);
    const nextValue =
      key === undefined ? parent.value : ownValue(parent.value, String(key));
    expand(child, nextPath, childPattern, nextValue, walk, ancestors);
  }
}

/**
 * Recursion through lazy() is bounded by the data rather than the schema.
 * A missing value still selects its declared descendants, like any other
 * container, but schema recursion then stops at the first repeated rule.
 */
function expandLazy(
  info: RuleMeta,
  parent: Parent,
  walk: Expansion,
  ancestors: Set<object>,
): void {
  const { path, pattern, value } = parent;
  const [[child]] = childrenOf(info.kind, info.children, pattern);
  if (!isNode(child)) return;
  if (isNode(value)) {
    expandLazyValue(child, value, parent, walk);
  } else if (tryEnter(ancestors, child)) {
    expand(child, path, pattern, value, walk, ancestors);
    ancestors.delete(child);
  }
}

function expandLazyValue(
  child: object,
  value: object,
  { path, pattern }: Parent,
  walk: Expansion,
): void {
  if (walk.values.has(value)) return;
  walk.values.add(value);
  expand(child, path, pattern, value, walk, new Set([child]));
  walk.values.delete(value);
}

function expansionKeys(
  tail: SchemaPath,
  value: unknown,
): Array<string | number | undefined> {
  if (!tail.length) return [undefined];
  return isStringValue(tail[0]) ? [tail[0]] : itemKeys(value, tail[0].binding);
}

function pathWithKey(
  path: ConcretePath,
  key: string | number | undefined,
): ConcretePath {
  // Expansion keys are already concrete: numbers for array items.
  return key === undefined ? path : [...path, key];
}

function tryEnter(ancestors: Set<object>, rule: unknown): rule is object {
  if (!isNode(rule) || ancestors.has(rule)) return false;
  ancestors.add(rule);
  return true;
}

function bindingsFor(
  pattern: SchemaPath,
  keys: readonly string[],
  length: number,
  path: ConcretePath,
): Map<string, string | number> {
  const bindings = new Map<string, string | number>();
  for (let i = 0; i < length; i++) {
    if (!isStringValue(pattern[i])) bindings.set(keys[i], path[i]);
  }
  return bindings;
}

// Keys for every prefix of a pattern, built in one pass. Each segment is
// JSON-encoded, so the joined keys stay unambiguous. Schema patterns from the
// graph are stable objects and reuse their keys across plans.
const prefixKeyCache = new WeakMap<SchemaPath, readonly string[]>();

function prefixKeys(pattern: SchemaPath): readonly string[] {
  let keys = prefixKeyCache.get(pattern);
  if (!keys) {
    const built: string[] = [];
    for (const segment of pattern) {
      const encoded = JSON.stringify(segment);
      built.push(
        built.length ? `${built[built.length - 1]},${encoded}` : encoded,
      );
    }
    keys = built;
    prefixKeyCache.set(pattern, keys);
  }
  return keys;
}

function patternKey(pattern: SchemaPath): string {
  return prefixKeys(pattern)[pattern.length - 1] ?? '';
}

function instantiate(
  pattern: SchemaPath,
  data: unknown,
  bindings: Map<string, string | number>,
  add: (path: ConcretePath) => void,
): void {
  const suffix = staticSuffix(pattern);
  function visit(offset: number, path: ConcretePath, value: unknown): void {
    const segment = pattern[offset];
    if (isStringValue(segment)) {
      visit(offset + 1, [...path, segment], ownValue(value, segment));
    } else {
      const bound = bindings.get(prefixKeys(pattern)[offset]);
      const keys =
        bound === undefined ? itemKeys(value, segment.binding) : [bound];
      for (const item of keys) {
        // Emit the final item and static tail together, without another path
        // allocation or reading the item value. Earlier items still need data.
        if (offset + 1 === suffix.offset) {
          add([...path, item, ...suffix.path]);
        } else {
          visit(offset + 1, [...path, item], ownValue(value, String(item)));
        }
      }
    }
  }
  // Dynamic traversal stops at its last item, so only a fully static pattern
  // needs this direct case. Every recursive visit precedes the static suffix.
  if (suffix.offset === 0) add([...suffix.path]);
  else visit(0, [], data);
}

function staticSuffix(pattern: SchemaPath): {
  offset: number;
  path: readonly string[];
} {
  let offset = pattern.length;
  while (offset > 0 && isStringValue(pattern[offset - 1])) offset--;
  return { offset, path: pattern.slice(offset) as readonly string[] };
}

/** The concrete member keys: array indexes as numbers, record keys as strings. */
function itemKeys(value: unknown, kind: string): Array<string | number> {
  if (kind === 'isArrayOf') {
    return isArray(value)
      ? Array.from({ length: value.length }, (_, i) => i)
      : [];
  }
  return isRecordValue(value)
    ? Object.keys(value).filter(key => !isUnsafeKey(key))
    : [];
}

/** Whether a name segment is a member of the collection, without listing it. */
function hasItemKey(value: unknown, kind: string, key: string): boolean {
  return kind === 'isArrayOf'
    ? isArrayIndex(value, key)
    : isRecordKey(value, key);
}

// A canonical array index: no sign, fraction or leading zero.
const ARRAY_INDEX = /^(?:0|[1-9]\d*)$/;

function isArrayIndex(value: unknown, key: string): boolean {
  return isArray(value) && ARRAY_INDEX.test(key) && Number(key) < value.length;
}

function isRecordKey(value: unknown, key: string): boolean {
  return (
    isRecordValue(value) &&
    !isUnsafeKey(key) &&
    !!Object.getOwnPropertyDescriptor(value, key)?.enumerable
  );
}

function isRecordValue(value: unknown): value is object {
  return isNode(value) && !isArray(value);
}

function concreteKey(key: string | number, kind: string): string | number {
  return kind === 'isArrayOf' ? Number(key) : key;
}

function ownValue(value: unknown, key: string): unknown {
  return isNode(value)
    ? Object.getOwnPropertyDescriptor(value, key)?.value
    : undefined;
}
