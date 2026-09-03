/* eslint-disable complexity, max-lines-per-function, max-statements -- suite finalization */
import {
  CB,
  hasOwnProperty,
  isNullish,
  isObject,
  makeResult,
  Result,
} from 'vest-utils';
import { VestRuntime } from 'vestjs-runtime';
import { EnforceSchemaError } from '../../../n4s/src/errors/EnforceSchemaError';
import { ITEM_SCHEMA } from '../../../n4s/src/schema/dependencyResolver';
import type { SchemaPath } from '../../../n4s/src/schema/SchemaPath';
import type { InternalRelationship } from '../../../n4s/src/schema/SchemaRelationship';

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

function slotsOf(value: unknown): Record<PropertyKey, unknown> {
  return value as unknown as Record<PropertyKey, unknown>;
}

function nestedShapeOf(rule: unknown): Record<PropertyKey, unknown> {
  const child: unknown = isObject(rule) ? slotsOf(rule).__schema : undefined;
  if (isObject(child)) return slotsOf(child);
  const item: unknown = isObject(rule) ? slotsOf(rule)[ITEM_SCHEMA] : undefined;
  const itemChild: unknown = isObject(item)
    ? slotsOf(item).__schema
    : undefined;
  if (isObject(itemChild)) return slotsOf(itemChild);
  return {};
}

function lastPropertyKeyOf(path: SchemaPath): string {
  const last: SchemaPath[number] | undefined = path[path.length - 1];
  if (last !== undefined && last.type === 'property') return String(last.key);
  return 'unknown';
}

function validateDeferredRoots(schema: unknown): void {
  try {
    const RESOLVED = Symbol.for('vest:resolvedRelationships');
    const ITEM = ITEM_SCHEMA;
    const relationships: InternalRelationship[] = [];
    const seen = new WeakSet<object>();
    const collect = (node: unknown): void => {
      if (!node || typeof node !== 'object' || seen.has(node)) return;
      seen.add(node);
      const rels = slotsOf(node)[RESOLVED] as
        | InternalRelationship[]
        | undefined;
      if (Array.isArray(rels) && rels.length) relationships.push(...rels);
      const inner: unknown = slotsOf(node).__schema;
      if (!isNullish(inner) && typeof inner === 'object') {
        if (Array.isArray(inner)) {
          for (const v of inner as unknown[]) collect(v);
        } else {
          for (const v of Object.values(slotsOf(inner))) collect(v);
          collect(inner);
        }
      }
      const item: unknown = slotsOf(node)[ITEM];
      if (item) collect(item);
      // Plain shape object (no __schema/RESOLVED wrapper)
      if (
        !slotsOf(node).__schema &&
        !slotsOf(node)[RESOLVED] &&
        !slotsOf(node)[ITEM]
      ) {
        // Check if this looks like a plain shape record
        const vals = Object.values(slotsOf(node));
        if (
          vals.length &&
          vals.some(
            (v: unknown): boolean =>
              !isNullish(v) &&
              typeof v === 'object' &&
              slotsOf(v).__schema !== undefined,
          )
        ) {
          for (const v of vals) collect(v);
        } else if (
          vals.length &&
          vals.some(
            (v: unknown): boolean =>
              !isNullish(v) &&
              typeof v === 'object' &&
              slotsOf(v)[RESOLVED] !== undefined,
          )
        ) {
          for (const v of vals) collect(v);
        }
      }
    };
    collect(schema);
    // Also collect from schema.__schema directly if schema is a RuleInstance wrapping a plain shape
    const schemaInner: unknown = slotsOf(schema).__schema;
    if (schemaInner) collect(schemaInner);
    if (!relationships.length) return;
    // Also consider top-level keys from describe dependencies target
    for (const rel of relationships) {
      const isRootSource = rel.__isRootSource === true;
      const isRootTarget = rel.__isRootTarget === true;
      if (!isRootSource && !isRootTarget) continue;
      // For root source, check full path exists in final schema (not just top-level)
      // to catch missing descendant like $.root.account.missing

      const checkPath = (path: SchemaPath, fieldForMsg: string): void => {
        const rootShape: unknown = slotsOf(schema).__schema;
        let current: Record<PropertyKey, unknown> = isObject(rootShape)
          ? slotsOf(rootShape)
          : {};
        path.forEach((seg: SchemaPath[number], i: number): void => {
          if (seg.type !== 'property') return;
          const key = String(seg.key);
          if (!hasOwnProperty(current, key)) {
            throw new EnforceSchemaError(
              `EnforceSchemaError: "${fieldForMsg}" depends on unknown field "${key}"`,
            );
          }
          const rule: unknown = current[key];
          if (i < path.length - 1) {
            current = nestedShapeOf(rule);
          }
        });
      };
      const targetField =
        Array.isArray(rel.target) && rel.target.length
          ? lastPropertyKeyOf(rel.target)
          : 'unknown';
      const sourceField =
        Array.isArray(rel.source) && rel.source.length
          ? lastPropertyKeyOf(rel.source)
          : 'unknown';
      if (isRootSource) {
        checkPath(rel.source, targetField);
      }
      if (isRootTarget) {
        checkPath(rel.target, sourceField);
      }
    }
  } catch (e) {
    if (isObject(e) && (e as { name?: unknown }).name === 'EnforceSchemaError')
      throw e;
    // Non-enforce errors (e.g., describe not available) are ignored
  }
}

export { createSuite };
