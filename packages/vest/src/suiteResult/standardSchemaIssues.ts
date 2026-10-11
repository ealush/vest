import type { StandardSchemaV1 } from 'vest-utils/standardSchemaSpec';

import { ROOT_SCHEMA_FIELD } from '../suite/retainedSchemaFailures';

/** One issue contract for SuiteResult and the Standard Schema adapter. */
export function standardSchemaIssues(
  errors: readonly { fieldName: string; message?: string }[],
): StandardSchemaV1.Issue[] {
  return errors.map(error => ({
    message:
      typeof error.message === 'string' ? error.message : 'Validation failed',
    // A failure of the input as a whole has no path; the root test name is
    // Vest's own and must not reach Standard Schema consumers as a property.
    path:
      error.fieldName && error.fieldName !== ROOT_SCHEMA_FIELD
        ? error.fieldName.split('.')
        : undefined,
  }));
}
