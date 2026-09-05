import { isArray, isObject } from 'vest-utils';

import { ITEM_CONTAINER, ITEM_SCHEMA } from './dependencyResolver';

export const MAP_VALUE = Symbol.for('vest:mapValue');

type MappingResult = { pass: boolean; type: unknown };
type InternalRule = Record<PropertyKey, unknown>;

/**
 * Applies known parser steps without executing validation predicates.
 *
 * This is the n4s-owned mapping contract used to seed Vest's callback data
 * for a first focused run. Failed parser steps preserve the input because an
 * unfocused field is not part of that run's validation verdict.
 *
 * @internal
 */
export function mapWithoutValidation(rule: unknown, value: unknown): unknown {
  if (!isObject(rule)) return value;
  const slots = rule as InternalRule;
  const mapped = mapStructuredValue(slots, value);
  const mapValue = slots[MAP_VALUE];
  if (typeof mapValue !== 'function') return mapped;
  const result = (mapValue as (input: unknown) => MappingResult)(mapped);
  return result.pass ? result.type : mapped;
}

// eslint-disable-next-line complexity -- discriminates n4s container metadata
function mapStructuredValue(rule: InternalRule, value: unknown): unknown {
  const shape = rule.__schema;
  if (isObject(shape) && isObject(value) && !isArray(value)) {
    return mapShape(shape as Record<string, unknown>, value as object);
  }

  const itemSchema = rule[ITEM_SCHEMA];
  if (isArray(value) && itemSchema !== undefined) {
    if (isArray(itemSchema)) {
      // Multi-rule arrays are unions, so choosing a mapper would require
      // validation. Tuple metadata has no container discriminator.
      if (rule[ITEM_CONTAINER] === 'array') return value;
      return value.map((item, index) =>
        mapWithoutValidation(itemSchema[index], item),
      );
    }
    return value.map(item => mapWithoutValidation(itemSchema, item));
  }
  if (
    rule[ITEM_CONTAINER] === 'record' &&
    itemSchema !== undefined &&
    isObject(value) &&
    !isArray(value)
  ) {
    return Object.fromEntries(
      Object.entries(value as object).map(([key, item]) => [
        key,
        mapWithoutValidation(itemSchema, item),
      ]),
    );
  }
  return value;
}

function mapShape(
  shape: Record<string, unknown>,
  value: object,
): Record<string, unknown> {
  const output = { ...value } as Record<string, unknown>;
  for (const key of Object.keys(shape)) {
    if (Object.prototype.hasOwnProperty.call(output, key)) {
      output[key] = mapWithoutValidation(shape[key], output[key]);
    }
  }
  return output;
}
