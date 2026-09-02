import type { SchemaPath } from './SchemaPath';
import { propertySegment } from './SchemaPath';

// Symbol to mark DependencyRef objects
export const DEPENDENCY_REF = Symbol('vest:dependencyRef');
export const ROOT_MARKER = Symbol('vest:rootMarker');

export type DependencyRef = {
  [DEPENDENCY_REF]: true;
  path: SchemaPath;
  isRoot: boolean;
};

export function isDependencyRef(value: unknown): value is DependencyRef {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as DependencyRef)[DEPENDENCY_REF] === true
  );
}

export type Scope = Record<string, Scope> & {
  readonly root: Scope;
};

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
        if (typeof prop === 'symbol') return undefined;
        const path: SchemaPath = [propertySegment(prop as string)];
        return createDependencyRef(path, true);
      },
    }) as unknown as Scope['root'];

  return new Proxy({} as Record<PropertyKey, unknown>, {
    get(_target, prop) {
      if (typeof prop === 'symbol') return undefined;
      if (prop === 'root') {
        return createRootProxy();
      }
      /** @deferred v2 */
      if (prop === 'parent') {
        throw new Error('$.parent deferred to v2');
      }
      const path: SchemaPath = [...scopePath, propertySegment(prop as string)];
      return createDependencyRef(path, false);
    },
  }) as Scope;
}

function createDependencyRef(path: SchemaPath, isRoot: boolean): DependencyRef {
  const base: DependencyRef = {
    [DEPENDENCY_REF]: true,
    path,
    isRoot,
  };
  // Proxy to support chained access like $.obj.leaf or $.root.foo.bar
  return new Proxy(base as unknown as object, {
    // eslint-disable-next-line complexity
    get(target: unknown, prop: PropertyKey) {
      if (prop === DEPENDENCY_REF) return true;
      if (prop === 'path') return (target as unknown as DependencyRef).path;
      if (prop === 'isRoot') return (target as unknown as DependencyRef).isRoot;
      if (typeof prop === 'symbol')
        return (target as unknown as Record<symbol, unknown>)[prop];
      // Prevent Promise-like then confusion and other internal props
      if (prop === 'then' || prop === 'toJSON' || prop === 'valueOf') {
        return undefined;
      }
      const propStr = String(prop);
      const extendedPath: SchemaPath = [
        ...(target as unknown as DependencyRef).path,
        propertySegment(propStr),
      ];
      return createDependencyRef(
        extendedPath,
        (target as unknown as DependencyRef).isRoot,
      );
    },
  }) as DependencyRef;
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
