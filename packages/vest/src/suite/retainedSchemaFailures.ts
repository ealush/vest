import { asArray, isStringValue, makeResult } from 'vest-utils';
import { VestRuntime, Walker } from 'vestjs-runtime';

import { VestTest } from '../core/isolate/IsolateTest/VestTest';

export const ROOT_SCHEMA_FIELD = '__root__';

export type RetainedSchemaFailure = {
  readonly path?: readonly string[];
  readonly message: string | undefined;
  readonly key: string;
};

/**
 * Which schema fields a focused run re-evaluates. Returns null when the run
 * validates the whole schema, in which case nothing needs to be retained.
 *
 * Focus applies to top-level schema keys (`only` picks them, `skip` omits
 * them). A failure is re-evaluated when its path starts at a picked key that
 * is not skipped. Root failures are always re-evaluated: every focused
 * schema still validates the input as a whole.
 */
export function schemaFocusOf(
  modifiers: { only?: unknown; skip?: unknown },
  focusesSchema: boolean,
): ((schemaField: string | undefined) => boolean) | null {
  if (!focusesSchema) return null;
  const only = fieldList(modifiers.only);
  const skip = fieldList(modifiers.skip);
  if (only === null && skip === null) return null;

  return schemaField => {
    if (schemaField === undefined) return true;
    const picked = only === null || only.includes(schemaField);
    const skipped = skip !== null && skip.includes(schemaField);
    return picked && !skipped;
  };
}

/**
 * Failing schema tests from the previous run whose fields this run does not
 * re-evaluate. Re-declare them with their source path and key so excluded
 * schema fields keep their failing verdict across subsequent focused runs.
 *
 * Reads the suite's own test tree, so resetField(), remove() and reset()
 * stay authoritative: a reset test is no longer failing and is not retained.
 * Must run before the new suite root is created.
 */
export function useRetainedSchemaFailures(
  isEvaluated: ((schemaField: string | undefined) => boolean) | null,
): RetainedSchemaFailure[] {
  if (isEvaluated === null) return [];
  const container = VestRuntime.useAvailableRoot()?.children?.find(
    child => child?.data?.schemaValidation,
  );
  if (!container) return [];

  const retained: RetainedSchemaFailure[] = [];
  Walker.walk(container, node => {
    if (
      VestTest.is(node) &&
      VestTest.isFailing(node).unwrap() &&
      isStringValue(node.key)
    ) {
      const { message } = VestTest.getData(node);
      const { schemaPath: path } = node.data as {
        schemaPath?: readonly string[];
      };
      if (!isEvaluated(schemaFieldOf(path)))
        retained.push({ path, message, key: node.key });
    }
    return makeResult.Ok(undefined);
  });
  return retained;
}

function fieldList(value: unknown): string[] | null {
  if (!value) return null;
  const list = asArray(value).filter(isStringValue);
  return list.length > 0 ? list : null;
}

function schemaFieldOf(
  path: readonly string[] | undefined,
): string | undefined {
  return path?.[0];
}
