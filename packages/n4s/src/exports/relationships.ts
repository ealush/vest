/** Opt-in relationship resolution for n4s schemas. */
import {
  FIELD,
  revision,
  installDescribe,
  meta,
  type Description,
  type Relationship,
  type SchemaPath,
  type Scope,
} from '../ruleMeta';

export { FIELD } from '../ruleMeta';
export type { Description, Relationship, SchemaPath, Scope } from '../ruleMeta';

export class EnforceSchemaError extends Error {
  name = 'EnforceSchemaError';
}

type Reference = { path: SchemaPath; rooted: boolean };
const REF = Symbol('n4s.relationships.ref');
const graphCache = new WeakMap<
  object,
  { revision: number; graph: Description }
>();

installDescribe(describeSchema);

export function describeSchema(schema: object): Description {
  let cached = graphCache.get(schema);
  if (!cached || cached.revision !== revision) {
    cached = { revision, graph: buildGraph(schema) };
    graphCache.set(schema, cached);
  }
  return {
    relationships: cached.graph.relationships.map(relationship => ({
      source: clonePath(relationship.source),
      target: clonePath(relationship.target),
      effect: 'invalidate',
    })),
  };
}

function buildGraph(root: object): Description {
  const context: GraphContext = {
    root,
    relationships: [],
    seen: new Set<string>(),
    checked: new Map<string, Walk>(),
  };
  const ancestors = new Set<object>();

  function visit(rule: unknown, path: SchemaPath): void {
    if (!isNode(rule) || ancestors.has(rule)) return;
    ancestors.add(rule);
    const info = meta(rule);
    appendDeclarations(info.declarations, path, context);
    for (const [child, childPath] of childrenOf(
      info.kind,
      info.children,
      path,
    )) {
      visit(child, childPath);
    }
    ancestors.delete(rule);
  }

  visit(root, []);
  return { relationships: context.relationships };
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
  const source = reference.rooted
    ? reference.path
    : [...target.slice(0, -1), ...reference.path];
  if (samePath(source, target)) return;
  const checked = checkedReference(context, source);
  if (!checked.found) unknownReference(target, source, checked);
  const key = JSON.stringify([source, target]);
  if (context.seen.has(key)) return;
  context.seen.add(key);
  context.relationships.push({ source, target, effect: 'invalidate' });
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

function childrenOf(
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
  kind: string,
  args: unknown[],
  path: SchemaPath,
): Array<[unknown, SchemaPath]> {
  return args.map(child => [child, [...path, { type: 'item', binding: kind }]]);
}

const memberChildren: Record<string, ChildrenHandler> = {
  compose: (args, path) => args.map(child => [child, path]),
  isArrayOf: (args, path) => itemChildren('isArrayOf', args, path),
  optional: (args, path) => args.map(child => [child, path]),
  record: (args, path) => itemChildren('record', args.slice(-1), path),
  tuple: (args, path) =>
    args.map((child, index) => [child, [...path, String(index)]]),
};

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
        `"${renderPath(target)}" dependsOn must return a field reference or an array of references`,
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
      if (key === 'parent') throw new Error('$.parent is not supported');
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
  const available = selectedEntries(kind, args, args[0]);
  return {
    next: available
      .filter(([name]) => name === segment)
      .map(([, child]) => child),
    keys: available.map(([name]) => name),
  };
}

function unwrap(rule: unknown): object[] {
  if (!isNode(rule)) return [];
  const info = meta(rule);
  if (info.kind === 'compose' || info.kind === 'optional') {
    return (info.children as unknown[]).flatMap(unwrap);
  }
  return [rule];
}

function isNode(value: unknown): value is object {
  return (
    (typeof value === 'object' && value !== null) || typeof value === 'function'
  );
}

function entries(value: unknown): Array<[string, unknown]> {
  if (!isNode(value)) return [];
  return Object.entries(Object.getOwnPropertyDescriptors(value))
    .filter(([, descriptor]) => 'value' in descriptor)
    .map(([key, descriptor]) => [key, descriptor.value]);
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

function samePath(left: SchemaPath, right: SchemaPath): boolean {
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
