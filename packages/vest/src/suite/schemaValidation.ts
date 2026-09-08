import type { SelectiveSchemaResult } from 'n4s/exports/internal';
import { makeResult } from 'vest-utils';
import { VestRuntime, Walker } from 'vestjs-runtime';

import { VestTest } from '../core/isolate/IsolateTest/VestTest';

/**
 * Retention belongs to Vest's test tree. Reading actual failing tests makes
 * resetField(), remove(), reset(), and resume() authoritative; there is no
 * parallel error cache to invalidate.
 */
export function useRetainedSchemaFailures(
  affected: readonly string[] | null,
): SelectiveSchemaResult[] {
  if (affected === null) return [];
  const root = VestRuntime.useAvailableRoot();
  const container = root?.children?.find(
    child => child.data.schemaValidation === true,
  );
  if (!container) return [];
  return Walker.reduce<SelectiveSchemaResult[]>(
    container,
    (failures, node) => {
      if (!VestTest.is(node) || !VestTest.isFailing(node).unwrap()) {
        return makeResult.Ok(failures);
      }
      const { fieldName, message } = VestTest.getData(node);
      const touched = affected.some(
        field =>
          fieldName === '__root__' ||
          field === fieldName ||
          field.startsWith(`${fieldName}.`) ||
          fieldName.startsWith(`${field}.`),
      );
      return makeResult.Ok(
        touched
          ? failures
          : [
              ...failures,
              {
                pass: false,
                message,
                path: fieldName === '__root__' ? [] : fieldName.split('.'),
              },
            ],
      );
    },
    [],
  );
}

export function schemaFailureField(result: SelectiveSchemaResult): string {
  return result.path?.length ? result.path.join('.') : '__root__';
}

/** Stable across changes in which other fields fail in the same run. */
export function schemaFailureKey(result: SelectiveSchemaResult): string {
  return JSON.stringify([result.path ?? [], result.message ?? null]);
}
