import { hasOwnProperty, isArray, isObject } from 'vest-utils';

import { ITEM_CONTAINER, ITEM_SCHEMA } from './schemaSlots';
import { isRuleNode } from './ruleNode';

export const MAP_VALUE = Symbol.for('vest:mapValue');
export const MAP_FULL_VALUE = Symbol.for('vest:mapFullValue');

type MappingResult = { type: unknown };
type InternalRule = Record<PropertyKey, unknown>;

/**
 * Applies known parser steps without executing validation predicates.
 *
 * This is the n4s-owned mapping contract used to seed Vest's callback data
 * for a first focused run. Parser results always provide their declared output
 * type, even when their validation verdict fails. Using that output keeps the
 * consuming callback's schema-output type truthful without adding untouched
 * fields to the focused run's validation verdict.
 *
 * @internal
 */
// eslint-disable-next-line max-statements -- mapping dispatch follows independent structural and parser slots
export function mapWithoutValidation(rule: unknown, value: unknown): unknown {
  if (!isRuleNode(rule)) return value;
  const slots = rule as InternalRule;
  const mapFullValue = slots[MAP_FULL_VALUE];
  if (typeof mapFullValue === 'function') {
    const result = (mapFullValue as (input: unknown) => MappingResult)(value);
    return result.type;
  }
  const mapped = mapStructuredValue(slots, value);
  const mapValue = slots[MAP_VALUE];
  if (typeof mapValue !== 'function') return mapped;
  const result = (mapValue as (input: unknown) => MappingResult)(mapped);
  return result.type;
}

// eslint-disable-next-line complexity, max-statements -- discriminates n4s container metadata
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
    if (hasOwnProperty(output, key)) {
      output[key] = mapWithoutValidation(shape[key], output[key]);
    }
  }
  return output;
}
