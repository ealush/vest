import { StandardSchemaV1 } from 'vest-utils/standardSchemaSpec';

import type { FIELD } from '../schema/scopeProxy';
import type { SchemaPath } from '../schema/SchemaPath';
import type {
  InternalRelationship,
  SchemaDependency,
  SchemaRelationship,
} from '../schema/SchemaRelationship';

import { RuleRunReturn } from './RuleRunReturn';

/**
 * Represents a lazy validation rule that can be executed with a value.
 * RuleInstances support chaining and can be reused across multiple validations.
 * Implements StandardSchemaV1 for interoperability with other schema libraries.
 *
 * @template T - The output type this rule produces (may differ from input when parsers are used)
 * @template Args - The argument types for this rule (Args[0] is the input type)
 */
export interface ScopeHandle {
  readonly root: ScopeHandle;
  [FIELD]: (fieldName: string) => ScopeHandle;
  [key: string]: ScopeHandle;
  [key: symbol]: unknown;
}

export type DescribeResult = {
  dependencies: SchemaDependency[];
  relationships: SchemaRelationship[];
};

export function clonePath(path: SchemaPath): SchemaPath {
  return path.map(seg => ({ ...seg }));
}

export function cloneRelationship(
  rel: InternalRelationship,
): SchemaRelationship {
  return {
    ...(rel.metadata ? { metadata: { ...rel.metadata } } : {}),
    effect: rel.effect,
    source: clonePath(rel.source),
    target: clonePath(rel.target),
  };
}

export function groupDependencies(
  resolved: SchemaRelationship[],
): SchemaDependency[] {
  const depMap = new Map<
    string,
    { target: SchemaPath; sources: SchemaPath[] }
  >();
  for (const rel of resolved) {
    const key = JSON.stringify(rel.target);
    let dep = depMap.get(key);
    if (!dep) {
      dep = { target: clonePath(rel.target), sources: [] };
      depMap.set(key, dep);
    }
    dep.sources.push(clonePath(rel.source));
  }
  return Array.from(depMap.values());
}

export class RuleInstance<T, Args extends any[] = any[]> {
  [key: string]: any;

  infer!: T;
  test!: (...args: Args) => boolean;
  run!: (...args: Args) => RuleRunReturn<T>;
  validate!: (...args: Args) => StandardSchemaV1.Result<T>;
  parse!: (...args: Args) => T;

  '~standard'!: StandardSchemaV1.Props<Args[0], T> & {
    readonly types: StandardSchemaV1.Types<Args[0], T>;
  };

  dependsOn!: (resolver: (scope: ScopeHandle) => unknown) => this;
  describe!: () => DescribeResult;

  private constructor() {}

  static create<R extends RuleInstance<T, Args>, T, Args extends any[]>(
    rule: (...args: Args) => RuleRunReturn<T>,
  ): R {
    const unresolvedDeps: Array<{
      resolver: (scope: ScopeHandle) => unknown;
    }> = [];
    const validate = (...args: Args): StandardSchemaV1.Result<T> => {
      const result = rule(...args);
      if (result.pass) return { value: result.type };
      return {
        issues: [
          {
            message: result.message || 'Validation failed',
            path: result.path || [],
          },
        ],
      };
    };

    const run = (...args: Args): RuleRunReturn<T> => rule(...args);

    const parse = (...args: Args): T => {
      const result = validate(...args);
      if (!result.issues) return result.value;
      const [firstIssue] = result.issues;
      throw new TypeError(firstIssue?.message || 'Validation failed');
    };

    const instance = {
      '~standard': {
        types: {
          input: undefined as unknown as Args[0],
          output: undefined as unknown as T,
        },
        validate,
        vendor: 'n4s',
        version: 1 as const,
      },
      infer: {} as T,
      run,
      parse,
      test: (...args: Args) => {
        const result = validate(...args);
        return !result.issues;
      },
      validate,
    } as unknown as R & {
      dependsOn: (resolver: (scope: ScopeHandle) => unknown) => R;
      describe: () => DescribeResult;
    };

    const dependsOn = (resolver: (scope: ScopeHandle) => unknown): R => {
      unresolvedDeps.push({ resolver });
      (instance as unknown as Record<symbol, unknown>)[
        Symbol.for('vest:unresolvedDeps')
      ] = unresolvedDeps;
      return instance as unknown as R;
    };

    const describe = (): DescribeResult => {
      const raw =
        ((instance as unknown as Record<symbol, unknown>)[
          Symbol.for('vest:resolvedRelationships')
        ] as InternalRelationship[]) || [];
      const resolved: SchemaRelationship[] = raw.map(cloneRelationship);
      return {
        dependencies: groupDependencies(resolved),
        relationships: resolved,
      };
    };

    (instance as unknown as Record<string, unknown>).dependsOn = dependsOn;
    (instance as unknown as Record<string, unknown>).describe = describe;
    (instance as unknown as Record<symbol, unknown>)[
      Symbol.for('vest:unresolvedDeps')
    ] = unresolvedDeps;

    return instance as unknown as R;
  }
}
