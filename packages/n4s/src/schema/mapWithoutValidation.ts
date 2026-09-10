import { hasOwnProperty, isArray, isObject } from 'vest-utils';

import { ITEM_CONTAINER, ITEM_SCHEMA } from './schemaSlots';
import { isRuleNode } from './ruleNode';

export const MAP_VALUE = Symbol.for('vest:mapValue');
export const MAP_FULL_VALUE = Symbol.for('vest:mapFullValue');

type MappingResult = { type: unknown };
// Full-value mappers own structural traversal and must report its provenance
// at the supplied absolute base, including unresolved union branch choices.
export type FullValueMapper = (
  value: unknown,
  provenance?: MappingProvenance,
  base?: readonly MappingPathSegment[],
) => MappingResult;
type InternalRule = Record<PropertyKey, unknown>;

export type MappingPathSegment = string | number;

/**
 * Provenance for pure parser mapping: absolute segment paths where a
 * parser step executed in this run. A path listed here means the mapped
 * output at (or under) it was produced by a parser — never raw
 * passthrough. Array merging uses it to prefer current-run parser output
 * over stale retained mappings when values alone cannot decide (an
 * idempotent parser output is indistinguishable from unmapped input).
 *
 * @internal
 */
export type MappingProvenance = {
  readonly mapped: Array<readonly MappingPathSegment[]>;
  /**
   * Absolute segment paths where parser-only mapping met a union whose
   * branch choice requires validation. The output there is raw passthrough,
   * never a proven branch mapping. The caller decides — from focus coverage
   * and retained witnesses — whether that is safe or must fail explicitly
   * before a typed callback observes it.
   */
  readonly unions: Array<readonly MappingPathSegment[]>;
};

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
export function mapWithoutValidation(
  rule: unknown,
  value: unknown,
  provenance?: MappingProvenance,
  base: readonly MappingPathSegment[] = [],
): unknown {
  return mapInner(rule, value, provenance, base);
}

function mapInner(
  rule: unknown,
  value: unknown,
  provenance: MappingProvenance | undefined,
  base: readonly MappingPathSegment[],
): unknown {
  if (!isRuleNode(rule)) return value;
  const slots = rule as InternalRule;
  const full = mapFullValueSlot(slots, value, provenance, base);
  if (full.applies) return full.value;
  return mapValueSlot(slots, value, provenance, base);
}

type SlotMapping = { applies: boolean; value: unknown };

function mapFullValueSlot(
  slots: InternalRule,
  value: unknown,
  provenance: MappingProvenance | undefined,
  base: readonly MappingPathSegment[],
): SlotMapping {
  const mapFullValue = slots[MAP_FULL_VALUE];
  if (typeof mapFullValue !== 'function') return { applies: false, value };
  const result = (mapFullValue as FullValueMapper)(value, provenance, base);
  return { applies: true, value: result.type };
}

function mapValueSlot(
  slots: InternalRule,
  value: unknown,
  provenance: MappingProvenance | undefined,
  base: readonly MappingPathSegment[],
): unknown {
  const mapped = mapStructuredValue(slots, value, provenance, base);
  const mapValue = slots[MAP_VALUE];
  if (typeof mapValue !== 'function') return mapped;
  markMapped(provenance, base);
  const result = (mapValue as (input: unknown) => MappingResult)(mapped);
  return result.type;
}

function markMapped(
  provenance: MappingProvenance | undefined,
  base: readonly MappingPathSegment[],
): void {
  provenance?.mapped.push(base);
}

// eslint-disable-next-line complexity, max-statements -- discriminates n4s container metadata
function mapStructuredValue(
  rule: InternalRule,
  value: unknown,
  provenance: MappingProvenance | undefined,
  base: readonly MappingPathSegment[],
): unknown {
  const shape = rule.__schema;
  if (isObject(shape) && isObject(value) && !isArray(value)) {
    return mapShape(
      shape as Record<string, unknown>,
      value as object,
      provenance,
      base,
    );
  }

  const itemSchema = rule[ITEM_SCHEMA];
  if (isArray(value) && itemSchema !== undefined) {
    if (isArray(itemSchema)) {
      // Multi-rule arrays are unions, so choosing a mapper would require
      // validation. Report the incomplete path and pass the raw value
      // through; the caller enforces the explicit error boundary where no
      // focus coverage or retained witness makes it safe. Tuple metadata
      // has no container discriminator.
      if (rule[ITEM_CONTAINER] === 'array') {
        provenance?.unions.push(base);
        return value;
      }
      return value.map((item, index) =>
        mapInner(itemSchema[index], item, provenance, [...base, index]),
      );
    }
    return value.map((item, index) =>
      mapInner(itemSchema, item, provenance, [...base, index]),
    );
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
        mapInner(itemSchema, item, provenance, [...base, key]),
      ]),
    );
  }
  return value;
}

function mapShape(
  shape: Record<string, unknown>,
  value: object,
  provenance: MappingProvenance | undefined,
  base: readonly MappingPathSegment[],
): Record<string, unknown> {
  const output = { ...value } as Record<string, unknown>;
  for (const key of Object.keys(shape)) {
    if (hasOwnProperty(output, key)) {
      output[key] = mapInner(shape[key], output[key], provenance, [
        ...base,
        key,
      ]);
    }
  }
  return output;
}
