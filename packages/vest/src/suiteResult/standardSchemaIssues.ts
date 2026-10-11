import { isStringValue } from 'vest-utils';
import type { StandardSchemaV1 } from 'vest-utils/standardSchemaSpec';

import { ROOT_SCHEMA_FIELD } from '../suite/retainedSchemaFailures';

const DEFAULT_MESSAGE = 'Validation failed';

/** One issue contract for SuiteResult and the Standard Schema adapter. */
export function standardSchemaIssues(
  errors: readonly { fieldName: string; message?: string }[],
): StandardSchemaV1.Issue[] {
  return errors.map(({ fieldName, message }) => ({
    // An empty message is as unhelpful to a consumer as a missing one.
    message: isStringValue(message) && message ? message : DEFAULT_MESSAGE,
    // A failure of the input as a whole has no path; the root test name is
    // Vest's own and must not reach Standard Schema consumers as a property.
    path:
      fieldName && fieldName !== ROOT_SCHEMA_FIELD
        ? fieldName.split('.')
        : undefined,
  }));
}
