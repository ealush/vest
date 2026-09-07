import type { SchemaPath } from './SchemaPath';
import { propertySegment } from './SchemaPath';

// Symbol to mark DependencyRef objects
export const DEPENDENCY_REF = Symbol('vest:dependencyRef');
export const ROOT_MARKER = Symbol('vest:rootMarker');

// Reference metadata lives on symbols — never on string keys — so EVERY
// string property access chains as a field name. Previously `path`/`isRoot`
// were string-keyed metadata, which made `$.nested.path` / `$.nested.isRoot`
// return metadata instead of a field reference.
export const REF_PATH = Symbol('vest:refPath');
export const REF_IS_ROOT = Symbol('vest:refIsRoot');

/**
 * Escape hatch for referencing a literal field whose name collides with a
 * JavaScript internal.
 *
 * `then` is intentionally the ONLY non-chainable string key on dependency
 * refs: if `ref.then` were defined, `await ref` / `Promise.resolve(ref)`
 * could mistake a returned ref for a thenable and throw a TypeError via
 * GetMethod. Every other string key — including `toJSON`, `valueOf`,
 * `path`, `isRoot`, and `self` — chains as a normal field name.
 *
 * To depend on a literal field named `then`, use the hatch:
 *   dependsOn($ => $[FIELD]('then'))
 *   dependsOn($ => $.nested[FIELD]('then'))
 *   dependsOn($ => $.root[FIELD]('then'))
 */
export const FIELD = Symbol('vest:scopeField');

export type DependencyRef = {
  [DEPENDENCY_REF]: true;
  [REF_PATH]: SchemaPath;
  [REF_IS_ROOT]: boolean;
};

export function isDependencyRef(value: unknown): value is DependencyRef {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as DependencyRef)[DEPENDENCY_REF] === true
  );
}

export function getRefPath(ref: DependencyRef): SchemaPath {
  return ref[REF_PATH];
}

export function isRootRef(ref: DependencyRef): boolean {
  return ref[REF_IS_ROOT] === true;
}

export interface Scope {
  readonly root: Scope;
  [FIELD]: (fieldName: string) => Scope;
  [key: string]: Scope;
}

/**
 * Creates the `$` scope proxy for a given scope.
 * `$` is scoped to current schema by default.
 * `$.root` escapes to top-level schema scope.
 */
export function createScopeProxy(scopePath: SchemaPath): Scope {
  const createRootProxy = (): Scope['root'] =>
    new Proxy({} as Record<PropertyKey, DependencyRef>, {
      get(_target, prop) {
        if (prop === ROOT_MARKER) return true as unknown as unknown;
        if (prop === FIELD)
          return (fieldName: string) =>
            createDependencyRef([propertySegment(fieldName)], true);
        if (typeof prop === 'symbol') return undefined;
        // `then` stays non-chainable so returned refs are never thenable.
        // A root-level field literally named `then` is reachable via $[FIELD].
        if (prop === 'then') return undefined;
        const path: SchemaPath = [propertySegment(prop as string)];
        return createDependencyRef(path, true);
      },
    }) as unknown as Scope['root'];

  return new Proxy({} as Record<PropertyKey, unknown>, {
    get(_target, prop) {
      if (prop === FIELD)
        return (fieldName: string) =>
          createDependencyRef(
            [...scopePath, propertySegment(fieldName)],
            false,
          );
      if (typeof prop === 'symbol') return undefined;
      return scopeStringProp(scopePath, createRootProxy, prop);
    },
  }) as unknown as Scope;
}

function scopeStringProp(
  scopePath: SchemaPath,
  createRootProxy: () => Scope['root'],
  prop: string | number,
): unknown {
  if (prop === 'root') {
    return createRootProxy();
  }
  /** @deferred v2 */
  if (prop === 'parent') {
    throw new Error('$.parent deferred to v2');
  }
  // `then` stays non-chainable so returned refs are never thenable.
  // A field literally named `then` is reachable via $[FIELD].
  if (prop === 'then') return undefined;
  const path: SchemaPath = [...scopePath, propertySegment(String(prop))];
  return createDependencyRef(path, false);
}

function createDependencyRef(path: SchemaPath, isRoot: boolean): DependencyRef {
  const base = {
    [DEPENDENCY_REF]: true,
    [REF_PATH]: path,
    [REF_IS_ROOT]: isRoot,
  } as DependencyRef;
  // Proxy to support chained access like $.obj.leaf or $.root.foo.bar.
  // Every string key chains as a field name — except `then`, which must stay
  // undefined so refs are never thenable (see FIELD for the escape hatch).
  return new Proxy(base as unknown as object, {
    get(target: unknown, prop: PropertyKey) {
      if (prop === FIELD)
        return (fieldName: string) =>
          createDependencyRef(
            [
              ...(target as unknown as DependencyRef)[REF_PATH],
              propertySegment(fieldName),
            ],
            (target as unknown as DependencyRef)[REF_IS_ROOT],
          );
      if (typeof prop === 'symbol')
        return (target as unknown as Record<symbol, unknown>)[prop];
      return chainStringProp(target, prop);
    },
  }) as DependencyRef;
}

function chainStringProp(target: unknown, prop: string | number): unknown {
  // `then` stays undefined so refs are never thenable (see FIELD).
  if (String(prop) === 'then') return undefined;
  const ref = target as unknown as DependencyRef;
  const extendedPath: SchemaPath = [
    ...ref[REF_PATH],
    propertySegment(String(prop)),
  ];
  return createDependencyRef(extendedPath, ref[REF_IS_ROOT]);
}

/**
 * Normalizes resolver return value to array of DependencyRefs.
 */
export function normalizeResolverResult(result: unknown): DependencyRef[] {
  if (!result) return [];
  if (Array.isArray(result)) {
    return result.filter(isDependencyRef);
  }
  if (isDependencyRef(result)) {
    return [result];
  }
  return [];
}
