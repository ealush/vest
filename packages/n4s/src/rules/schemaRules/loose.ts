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
 * Validates that an object matches a schema loosely - all schema keys required, extra keys allowed.
 * Like shape() but permits additional properties not defined in the schema.
 */
// eslint-disable-next-line complexity
export function loose<S extends Record<string, RuleInstance<any>>>(
  value: Record<string, unknown>,
  schema: S,
): RuleRunReturn<LooseShapeValue<S>> {
  if (!isObject(value)) {
    return RuleRunReturn.Failing(value);
  }

  const dangerousInputKey = getDangerousOwnKey(value);
  if (dangerousInputKey) {
    return {
      ...RuleRunReturn.Failing(value),
      path: [dangerousInputKey],
    } as RuleRunReturn<LooseShapeValue<S>>;
  }

  const dangerousSchemaKey = getDangerousOwnKey(
    schema as Record<string, unknown>,
  );
  if (dangerousSchemaKey) {
    return {
      ...RuleRunReturn.Failing(value),
      path: [dangerousSchemaKey],
    } as RuleRunReturn<LooseShapeValue<S>>;
  }

  const parsedValue = createSafeObjectCopy(value);

  for (const key of ownKeys(schema as Record<string, unknown>)) {
    const fieldValue = hasOwn(value, key) ? value[key] : undefined;
    const res = ctx.run({ value: fieldValue, set: true, meta: { key } }, () =>
      schema[key].run(fieldValue),
    );

    if (!res.pass) {
      const currentPath = res.path || [];
      return {
        ...res,
        path: [key, ...currentPath],
      } as RuleRunReturn<LooseShapeValue<S>>;
    }

    parsedValue[key] = res.type;
  }

  return RuleRunReturn.Passing(parsedValue as LooseShapeValue<S>);
}

// Types colocated with loose rule
export type LooseRuleInstance<S extends Record<string, RuleInstance<any>>> =
  RuleInstance<
    ShapeType<S> & Record<string, unknown>,
    [ShapeType<S> & Record<string, unknown>]
  >;

export type LooseShapeValue<S extends Record<string, RuleInstance<any>>> =
  ShapeType<S> & Record<string, unknown>;
