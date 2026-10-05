import type { StandardSchemaV1 } from 'vest-utils/standardSchemaSpec';

/** One issue contract for SuiteResult and the Standard Schema adapter. */
export function standardSchemaIssues(
  errors: readonly { fieldName: string; message?: string }[],
): StandardSchemaV1.Issue[] {
  return errors.map(error => ({
    message:
      typeof error.message === 'string' ? error.message : 'Validation failed',
    path: error.fieldName ? error.fieldName.split('.') : undefined,
  }));
}
