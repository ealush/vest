/* eslint-disable complexity -- suite finalization */
import { CB, makeResult, Result } from 'vest-utils';
import { VestRuntime } from 'vestjs-runtime';

import { useCreateVestState } from '../core/Runtime';
import { useInitVestBus } from '../core/VestBus/VestBus';
import { VestReconciler } from '../core/isolate/VestReconciler';
import {
  InferSchemaOutput,
  TFieldName,
  TGroupName,
  TSchema,
} from '../suiteResult/SuiteResultTypes';

import { Suite, SuiteCallbackWithSchema } from './SuiteTypes';
import {
  useBindSuiteLifecycle,
  useCreateSuiteMethods,
} from './useCreateSuiteMethods';
import { validateSuiteCallback } from './validateSuiteCallback/validateSuiteCallback';

export type SuiteConfig = {
  fields: string;
  groups?: string;
};

// @vx-allow use-use
function createSuite<_Escape>(
  suiteCallback: [_Escape] extends [null] ? CB : never,
  schema?: any,
): [_Escape] extends [null] ? Suite<TFieldName, TGroupName, CB, any> : never;
// @vx-allow use-use
function createSuite<
  C extends SuiteConfig,
  Data = any,
  T extends (data: Data, ...args: any[]) => void = (
    data: Data,
    ...args: any[]
  ) => void,
>(
  suiteCallback: T,
  schema?: undefined,
): Suite<
  C['fields'],
  C['groups'] extends string ? C['groups'] : string,
  T,
  undefined
>;
// @vx-allow use-use
function createSuite<
  S extends TSchema,
  T extends (data: InferSchemaOutput<S>, ...args: any[]) => void = (
    data: InferSchemaOutput<S>,
    ...args: any[]
  ) => void,
>(
  suiteCallback: T,
  schema: S,
): Suite<Extract<keyof InferSchemaOutput<S>, string>, TGroupName, T, S>;
// @vx-allow use-use
function createSuite<
  F extends TFieldName = TFieldName,
  G extends TGroupName = TGroupName,
  T extends CB = CB,
  S extends TSchema = undefined,
>(suiteCallback: SuiteCallbackWithSchema<S, T>, schema?: S): Suite<F, G, T, S>;
// @vx-allow use-use
function createSuite<
  F extends TFieldName = TFieldName,
  G extends TGroupName = TGroupName,
  T extends CB = CB,
  S extends TSchema = undefined,
>(suiteCallback: T, schema?: S): Suite<F, G, T, S> {
  const suiteCallbackResult = validateSuiteCallback(suiteCallback).unwrap();
  if (schema) {
    validateDeferredRoots(schema);
  }

  const stateRef = useCreateVestState({ VestReconciler });

  return VestRuntime.Run(stateRef, () => {
    const VestBus = useInitVestBus();

    return createSuiteInstance().unwrap();

    function createSuiteInstance(): Result<Suite<F, G, T, S>> {
      const methods = useCreateSuiteMethods<F, G, T, S>(
        suiteCallbackResult as SuiteCallbackWithSchema<S, T>,
        {},
        VestBus.subscribe,
        schema,
      );

      return makeResult.Ok(useBindSuiteLifecycle(methods));
    }
  });
}

function validateDeferredRoots(schema: any): void {
  try {
    // Use raw internal relationships to preserve __isRootSource/Target flags
    // (describe() strips them). Fall back to describe() for non-shape schemas.
    const RESOLVED = Symbol.for('vest:resolvedRelationships');
    const rawRels = (schema as any)[RESOLVED] as
      | Array<Record<string, any>>
      | undefined;
    const relationships: Array<Record<string, any>> =
      rawRels && Array.isArray(rawRels) ? rawRels : [];
    if (!relationships.length) return;
    // topKeys kept for fallback when __schema missing
    const _topKeys = new Set(Object.keys((schema as any).__schema || {}));
    void _topKeys;
    // Also consider top-level keys from describe dependencies target
    for (const rel of relationships) {
      const isRootSource = (rel as any).__isRootSource === true;
      const isRootTarget = (rel as any).__isRootTarget === true;
      if (!isRootSource && !isRootTarget) continue;
      // For root source, check full path exists in final schema (not just top-level)
      // to catch missing descendant like $.root.account.missing

      const checkPath = (path: any[], fieldForMsg: string): void => {
        let current: any = (schema as any).__schema || {};
        path.forEach((seg: any, i: number) => {
          if (seg.type !== 'property') return;
          const key = String(seg.key);
          if (!Object.prototype.hasOwnProperty.call(current, key)) {
            const err = new Error(
              `EnforceSchemaError: "${fieldForMsg}" depends on unknown field "${key}"`,
            );
            err.name = 'EnforceSchemaError';
            throw err;
          }
          const rule: any = current[key];
          if (i < path.length - 1) {
            if (rule?.__schema) current = rule.__schema;
            else if (rule?.[Symbol.for('vest:itemSchema')]) {
              const item: any = rule[Symbol.for('vest:itemSchema')];
              current = item?.__schema ?? {};
            } else current = {};
          }
        });
      };
      const targetField =
        Array.isArray(rel.target) && rel.target.length
          ? String((rel.target[rel.target.length - 1] as any)?.key ?? 'unknown')
          : 'unknown';
      const sourceField =
        Array.isArray(rel.source) && rel.source.length
          ? String((rel.source[rel.source.length - 1] as any)?.key ?? 'unknown')
          : 'unknown';
      if (isRootSource) {
        checkPath(rel.source as any[], targetField);
      }
      if (isRootTarget) {
        checkPath(rel.target as any[], sourceField);
      }
    }
  } catch (e) {
    if ((e as any)?.name === 'EnforceSchemaError') throw e;
    // Non-enforce errors (e.g., describe not available) are ignored
  }
}

export { createSuite };
