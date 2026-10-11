/** Relationship graph internals behind the opt-in `n4s/relationships` entry. */
import { isFunction, isObject } from 'vest-utils';

import {
  FIELD,
  meta,
  type Description,
  type Relationship,
  type SchemaPath,
  type Scope,
} from './ruleMeta';

export class EnforceSchemaError extends Error {
  name = 'EnforceSchemaError';
}

type Reference = { path: SchemaPath; rooted: boolean };
const REF = Symbol('n4s.relationships.ref');
const FIELD_HINT = "Use $[FIELD]('name') for fields named root, parent or then";
// Recursive lazy() factories may build a fresh schema per level.
const MAX_LAZY_DEPTH = 32;
// dependsOn() never mutates a rule, so a schema's graph never changes.
const graphCache = new WeakMap<object, Description>();

export function describeSchema(schema: object): Description {
  let graph = graphCache.get(schema);
  if (!graph) {
    graph = buildGraph(schema);
    graphCache.set(schema, graph);
  }
  return {
    relationships: graph.relationships.map(relationship => ({
      source: clonePath(relationship.source),
      target: clonePath(relationship.target),
      effect: 'invalidate',
    })),
  };
}

function buildGraph(root: object): Description {
  const context: GraphContext = {
    checked: new Map<string, Walk>(),
    relationships: [],
    root,
    seen: new Set<string>(),
  };
  const ancestors = new Set<object>();

  function visit(rule: unknown, path: SchemaPath, lazyDepth: number): void {
    if (!isNode(rule)) return;
    checkLazyDepth(lazyDepth);
    if (ancestors.has(rule)) {
      rejectRecursiveDeclarations(rule, path);
      return;
    }
    ancestors.add(rule);
    const info = meta(rule);
    appendDeclarations(info.declarations, path, context);
    for (const [child, childPath] of childrenOf(
      info.kind,
      info.children,
      path,
    )) {
      visit(child, childPath, nextLazyDepth(info.kind, lazyDepth));
    }
    ancestors.delete(rule);
  }

  visit(root, [], 0);
  return { relationships: context.relationships };
}

function checkLazyDepth(depth: number): void {
  if (depth <= MAX_LAZY_DEPTH) return;
  throw new EnforceSchemaError(
    'Relationship graphs support at most 32 nested lazy() expansions; recursive factories must reuse a schema instance',
  );
}

function nextLazyDepth(kind: string | undefined, lazyDepth: number): number {
  return kind === 'lazy' ? lazyDepth + 1 : lazyDepth;
}

/** Schema paths cannot express unbounded depth, so recursion must be declaration-free. */
function rejectRecursiveDeclarations(rule: object, path: SchemaPath): void {
  if (!hasDeclarations(rule)) return;
  throw new EnforceSchemaError(
    `"${renderPath(path)}" is inside a recursive lazy() schema; dependsOn is not supported there`,
  );
}

function hasDeclarations(root: object): boolean {
  const seen = new Set<object>();
  function search(rule: unknown, lazyDepth: number): boolean {
    if (!isNode(rule) || seen.has(rule)) return false;
    checkLazyDepth(lazyDepth);
    seen.add(rule);
    const info = meta(rule);
    if (info.declarations.length) return true;
    const depth = nextLazyDepth(info.kind, lazyDepth);
    return childrenOf(info.kind, info.children, []).some(([child]) =>
      search(child, depth),
    );
  }
  return search(root, 0);
}

type GraphContext = {
  root: object;
  relationships: Relationship[];
  seen: Set<string>;
  checked: Map<string, Walk>;
};

function appendDeclarations(
  declarations: Array<(scope: Scope) => unknown>,
  path: SchemaPath,
  context: GraphContext,
): void {
  for (const resolver of declarations) {
    for (const reference of resolve(resolver, path)) {
      appendRelationship(path, reference, context);
    }
  }
}

function appendRelationship(
  target: SchemaPath,
  reference: Reference,
  context: GraphContext,
): void {
  const source = sourceOf(target, reference);
  if (isSamePath(source, target)) return;
  const checked = checkedReference(context, source);
  if (!checked.found) unknownReference(target, source, checked);
  if (!target.length) rootTarget(source);
  const key = JSON.stringify([source, target]);
  if (context.seen.has(key)) return;
  context.seen.add(key);
  context.relationships.push({ source, target, effect: 'invalidate' });
}

/** Sibling references resolve inside the target's containing shape. */
function sourceOf(target: SchemaPath, reference: Reference): SchemaPath {
  return reference.rooted
    ? reference.path
    : [...target.slice(0, -1), ...reference.path];
}

/**
 * The root is not a field: it has no name to focus and a change anywhere
 * already reaches it. Declare the dependency on the affected field instead.
 */
function rootTarget(source: SchemaPath): never {
  throw new EnforceSchemaError(
    `The root schema cannot depend on "${renderPath(source)}"; declare dependsOn on the field whose result changes`,
  );
}

function checkedReference(context: GraphContext, source: SchemaPath): Walk {
  const key = JSON.stringify(source);
  let result = context.checked.get(key);
  if (!result) {
    result = walkSchemaPath(context.root, source);
    context.checked.set(key, result);
  }
  return result;
}

function unknownReference(
  target: SchemaPath,
  source: SchemaPath,
  checked: Walk,
): never {
  const suggestion = suggest(
    checked.missing,
    checked.keys,
    String(target[target.length - 1]),
  );
  throw new EnforceSchemaError(
    `"${renderPath(target)}" depends on unknown field "${renderPath(source)}"${suggestion ? `. Did you mean "${suggestion}"?` : ''}`,
  );
}

export function childrenOf(
  kind: string | undefined,
  children: unknown,
  path: SchemaPath,
): Array<[unknown, SchemaPath]> {
  const args = (children as unknown[]) ?? [];
  if (isShapeKind(kind)) {
    return shapeChildren(kind, args, path);
  }
  const handler = memberChildren[kind ?? ''];
  if (handler) return handler(args, path);
  return [];
}

type ChildrenHandler = (
  args: unknown[],
  path: SchemaPath,
) => Array<[unknown, SchemaPath]>;

function shapeChildren(
  kind: string | undefined,
  args: unknown[],
  path: SchemaPath,
): Array<[unknown, SchemaPath]> {
  return selectedEntries(kind, args, args[0]).map(([name, child]) => [
    child,
    [...path, name],
  ]);
}

function itemChildren(
  kind: 'isArrayOf' | 'record',
  args: unknown[],
  path: SchemaPath,
): Array<[unknown, SchemaPath]> {
  return args.map(child => [child, [...path, { type: 'item', binding: kind }]]);
}

const samePath: ChildrenHandler = (args, path) =>
  args.map(child => [child, path]);

// Compound and wrapper rules validate their inner rules at the same path.
const memberChildren: Record<string, ChildrenHandler> = {
  allOf: samePath,
  anyOf: samePath,
  compose: samePath,
  isArrayOf: (args, path) => itemChildren('isArrayOf', args, path),
  lazy: (resolve, path) => [[resolveLazy(resolve), path]],
  noneOf: samePath,
  oneOf: samePath,
  optional: samePath,
  record: (args, path) => itemChildren('record', args.slice(-1), path),
  tuple: (args, path) =>
    args.map((child, index) => [child, [...path, String(index)]]),
};

function resolveLazy(resolve: unknown): unknown {
  return typeof resolve === 'function' ? resolve() : undefined;
}

function isShapeKind(kind: string | undefined): boolean {
  return (
    kind === 'shape' ||
    kind === 'loose' ||
    kind === 'partial' ||
    kind === 'pick' ||
    kind === 'omit'
  );
}

function resolve(
  resolver: (scope: Scope) => unknown,
  target: SchemaPath,
): Reference[] {
  if (typeof resolver !== 'function') {
    throw new EnforceSchemaError(
      `"${renderPath(target)}" dependsOn expects a function`,
    );
  }
  let result: unknown;
  try {
    result = resolver(scopeProxy());
  } catch (cause) {
    const detail = cause instanceof Error ? `: ${cause.message}` : '';
    throw new EnforceSchemaError(
      `"${renderPath(target)}" dependency resolver failed${detail}`,
      {
        cause,
      },
    );
  }
  const refs = Array.isArray(result) ? result : [result];
  return refs.map(value => {
    const reference = isNode(value) ? Reflect.get(value, REF) : undefined;
    if (!reference || !reference.path.length) {
      throw new EnforceSchemaError(
        `"${renderPath(target)}" dependsOn must return a field reference or an array of references. ${FIELD_HINT}`,
      );
    }
    return reference as Reference;
  });
}

function scopeProxy(): Scope {
  const root = new Proxy(
    {},
    {
      get(_target, key) {
        if (key === FIELD) return (name: string) => ref([name], true);
        if (typeof key === 'symbol' || key === 'then') return undefined;
        return ref([String(key)], true);
      },
    },
  );
  return new Proxy({} as Scope, {
    get(_target, key) {
      if (key === 'root') return root;
      if (key === 'parent') {
        throw new Error(`$.parent is not supported. ${FIELD_HINT}`);
      }
      return refProperty([], false, key);
    },
  });
}

function ref(path: SchemaPath, rooted: boolean): Scope {
  return new Proxy({} as Scope, {
    get(_target, key) {
      return refProperty(path, rooted, key);
    },
  });
}

function refProperty(
  path: SchemaPath,
  rooted: boolean,
  key: PropertyKey,
): unknown {
  if (key === REF) return { path, rooted };
  if (key === FIELD) return (name: string) => ref([...path, name], rooted);
  if (typeof key === 'symbol' || key === 'then') return undefined;
  return ref([...path, String(key)], rooted);
}

type Walk = { found: boolean; missing: string; keys: string[] };

export function walkSchemaPath(root: object, path: SchemaPath): Walk {
  let candidates: unknown[] = [root];
  for (const segment of path) {
    const { next, keys } = stepCandidates(candidates, segment);
    if (!next.length) {
      return { found: false, missing: String(segment), keys };
    }
    candidates = next;
  }
  return { found: true, missing: '', keys: [] };
}

function stepCandidates(
  candidates: unknown[],
  segment: SchemaPath[number],
): {
  next: unknown[];
  keys: string[];
} {
  const next: unknown[] = [];
  const keys: string[] = [];
  for (const candidate of candidates) {
    for (const rule of unwrap(candidate)) {
      const entries = stepRule(rule, segment);
      next.push(...entries.next);
      keys.push(...entries.keys);
    }
  }
  return { next, keys };
}

function stepRule(
  rule: object,
  segment: SchemaPath[number],
): {
  next: unknown[];
  keys: string[];
} {
  const info = meta(rule);
  const args = (info.children as unknown[]) ?? [];
  if (typeof segment !== 'string') return itemStep(info.kind, args);
  if (info.kind === 'tuple') return tupleStep(args, segment);
  if (!isShapeKind(info.kind)) return { next: [], keys: [] };
  return shapeStep(info.kind, args, segment);
}

function tupleStep(
  args: unknown[],
  segment: string,
): {
  next: unknown[];
  keys: string[];
} {
  return {
    next: /^\d+$/.test(segment) ? [args[Number(segment)]].filter(Boolean) : [],
    keys: [],
  };
}

function itemStep(
  kind: string | undefined,
  args: unknown[],
): {
  next: unknown[];
  keys: string[];
} {
  if (kind !== 'isArrayOf' && kind !== 'record') return { next: [], keys: [] };
  return {
    next: memberChildren[kind](args, []).map(([child]) => child),
    keys: [],
  };
}

function shapeStep(
  kind: string | undefined,
  args: unknown[],
  segment: string,
): {
  next: unknown[];
  keys: string[];
} {
  const descriptor = ownDataDescriptor(args[0], segment);
  if (descriptor && isSelectedKey(kind, args, segment)) {
    return { next: [descriptor.value], keys: [] };
  }
  const available = selectedEntries(kind, args, args[0]);
  return {
    next: available
      .filter(([name]) => name === segment)
      .map(([, child]) => child),
    keys: available.map(([name]) => name),
  };
}

function ownDataDescriptor(
  value: unknown,
  key: string,
): PropertyDescriptor | undefined {
  if (!isNode(value)) return;
  const descriptor = Object.getOwnPropertyDescriptor(value, key);
  return descriptor?.enumerable && 'value' in descriptor
    ? descriptor
    : undefined;
}

function isSelectedKey(
  kind: string | undefined,
  args: unknown[],
  key: string,
): boolean {
  if (kind !== 'pick' && kind !== 'omit') return true;
  const selected = new Set(Array.isArray(args[1]) ? args[1] : [args[1]]);
  return kind === 'pick' ? selected.has(key) : !selected.has(key);
}

function isTransparent(kind: string | undefined): boolean {
  return kind === 'lazy' || memberChildren[kind ?? ''] === samePath;
}

/** Looks through wrappers, compounds and lazy() to the rules that own keys. */
function unwrap(rule: unknown, seen = new Set<object>()): object[] {
  if (!isNode(rule) || seen.has(rule)) return [];
  seen.add(rule);
  const { kind, children } = meta(rule);
  if (!isTransparent(kind)) return [rule];
  return childrenOf(kind, children, []).flatMap(([child]) =>
    unwrap(child, seen),
  );
}

export function isNode(value: unknown): value is object {
  return isObject(value) || isFunction(value);
}

function entries(value: unknown): Array<[string, unknown]> {
  if (!isNode(value)) return [];
  const result: Array<[string, unknown]> = [];
  for (const key of Object.keys(value)) {
    const descriptor = ownDataDescriptor(value, key);
    if (descriptor) result.push([key, descriptor.value]);
  }
  return result;
}

function selectedEntries(
  kind: string | undefined,
  args: unknown[],
  shape: unknown,
): Array<[string, unknown]> {
  const all = entries(shape);
  if (kind !== 'pick' && kind !== 'omit') return all;
  const selected = new Set(Array.isArray(args[1]) ? args[1] : [args[1]]);
  return all.filter(([name]) =>
    kind === 'pick' ? selected.has(name) : !selected.has(name),
  );
}

function clonePath(path: SchemaPath): SchemaPath {
  return path.map(part => (typeof part === 'string' ? part : { ...part }));
}

function renderPath(path: SchemaPath): string {
  return path.map(part => (typeof part === 'string' ? part : '*')).join('.');
}

function isSamePath(left: SchemaPath, right: SchemaPath): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function suggest(
  unknown: string,
  keys: string[],
  dependent: string,
): string | undefined {
  return keys
    .filter(key => key !== dependent)
    .map(key => ({ key, score: distance(key, unknown) }))
    .filter(item => item.score <= 2)
    .sort((a, b) => a.score - b.score)[0]?.key;
}

function distance(a: string, b: string): number {
  let row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const next = [i];
    for (let j = 1; j <= b.length; j++) {
      next[j] = Math.min(
        next[j - 1] + 1,
        row[j] + 1,
        row[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    row = next;
  }
  return row[b.length];
}
