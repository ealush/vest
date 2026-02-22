import { isObject } from 'vest-utils';

import { ctx } from '../../enforceContext';
import type { RuleInstance } from '../../utils/RuleInstance';
import { RuleRunReturn } from '../../utils/RuleRunReturn';

import type { ShapeType } from './shape';
import {
  createSafeObjectCopy,
  getDangerousOwnKey,
  hasOwn,
  ownKeys,
} from './schemaObjectUtils';

/**
 * Checks if value has any keys not present in schema.
 */
function hasExtraKeys(
  value: Record<string, unknown>,
  schemaKeys: Set<string>,
): boolean {
  for (const key of ownKeys(value)) {
    if (!schemaKeys.has(key)) {
      return true;
    }
  }
  return false;
}

/**
 * Validates provided keys against their schema rules.
 * Missing keys are allowed (partial validation).
 */
function validateProvidedKeys<S extends Record<string, RuleInstance<any>>>(
  value: Record<string, unknown>,
  schema: S,
): RuleRunReturn<Partial<ShapeType<S>>> {
  const parsedValue = createSafeObjectCopy(value);
  for (const key of ownKeys(schema as Record<string, unknown>)) {
    if (hasOwn(value, key)) {
      const fieldValue = value[key];
      const res = ctx.run({ value: fieldValue, set: true, meta: { key } }, () =>
        schema[key].run(fieldValue),
      );
      if (!res.pass) {
        return {
          ...res,
          path: [key, ...(res.path || [])],
        } as RuleRunReturn<Partial<ShapeType<S>>>;
      }

      parsedValue[key] = res.type;
    }
  }
  return RuleRunReturn.Passing(parsedValue as Partial<ShapeType<S>>);
}

/**
 * Validates that an object partially matches a schema - schema keys are optional, no extra keys allowed.
 */
export function partial<S extends Record<string, RuleInstance<any>>>(
  value: Record<string, unknown>,
  schema: S,
): RuleRunReturn<Partial<ShapeType<S>>> {
  if (!isObject(value)) {
    return RuleRunReturn.Failing(value as Partial<ShapeType<S>>);
  }

  const dangerousInputKey = getDangerousOwnKey(value);
  if (dangerousInputKey) {
    return {
      ...RuleRunReturn.Failing(value as Partial<ShapeType<S>>),
      path: [dangerousInputKey],
    };
  }

  const dangerousSchemaKey = getDangerousOwnKey(
    schema as Record<string, unknown>,
  );
  if (dangerousSchemaKey) {
    return {
      ...RuleRunReturn.Failing(value as Partial<ShapeType<S>>),
      path: [dangerousSchemaKey],
    };
  }

  const schemaKeys = new Set(ownKeys(schema as Record<string, unknown>));

  if (hasExtraKeys(value, schemaKeys)) {
    return RuleRunReturn.Failing(value as Partial<ShapeType<S>>);
  }

  return validateProvidedKeys(value, schema);
}

// Types colocated with partial rule
export type PartialRuleInstance<S extends Record<string, RuleInstance<any>>> =
  RuleInstance<Partial<ShapeType<S>>, [Partial<ShapeType<S>>]>;

export type PartialShapeValue<S extends Record<string, RuleInstance<any>>> =
  Partial<ShapeType<S>>;
