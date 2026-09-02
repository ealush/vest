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

// eslint-disable-next-line complexity -- suite finalization walks deferred roots
function validateDeferredRoots(schema: any): void {
  try {
    const desc =
      typeof schema.describe === 'function' ? schema.describe() : null;
    if (!desc || !Array.isArray(desc.relationships)) return;
    const topKeys = new Set(Object.keys((schema as any).__schema || {}));
    // Also consider top-level keys from describe dependencies target
    for (const rel of desc.relationships as Array<Record<string, any>>) {
      const isRootSource = (rel as any).__isRootSource === true;
      const isRootTarget = (rel as any).__isRootTarget === true;
      if (!isRootSource && !isRootTarget) continue;
      // For root source, check source top-level key exists in final schema
      const sourceTop =
        Array.isArray(rel.source) && rel.source[0]?.type === 'property'
          ? String(rel.source[0].key)
          : null;
      const targetTop =
        Array.isArray(rel.target) && rel.target[0]?.type === 'property'
          ? String(rel.target[0].key)
          : null;
      // Source root: sourceTop must be in topKeys
      if (isRootSource && sourceTop && !topKeys.has(sourceTop)) {
        const {
          EnforceSchemaError,
        } = require('n4s/src/errors/EnforceSchemaError');
        const targetField =
          targetTop ||
          (Array.isArray(rel.target)
            ? String(rel.target[rel.target.length - 1]?.key ?? 'unknown')
            : 'unknown');
        throw new EnforceSchemaError(
          `EnforceSchemaError: "${targetField}" depends on unknown field "${sourceTop}"`,
        );
      }
      if (isRootTarget && targetTop && !topKeys.has(targetTop)) {
        const {
          EnforceSchemaError,
        } = require('n4s/src/errors/EnforceSchemaError');
        const sourceField = sourceTop || 'unknown';
        throw new EnforceSchemaError(
          `EnforceSchemaError: "${sourceField}" depends on unknown field "${targetTop}"`,
        );
      }
    }
  } catch (e) {
    if ((e as any)?.name === 'EnforceSchemaError') throw e;
    // Non-enforce errors (e.g., describe not available) are ignored
  }
}

export { createSuite };
