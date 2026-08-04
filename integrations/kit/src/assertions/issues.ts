import type { StandardSchemaV1 } from '@standard-schema/spec';

import { normalizeIssuePath, pathsEqual } from './paths.js';
import { assert } from './types.js';

export function assertIssue(
  issues: readonly StandardSchemaV1.Issue[],
  expected: { message?: string; path?: readonly PropertyKey[] },
): void {
  const match = issues.find(issue => {
    const messageMatches =
      expected.message === undefined || issue.message === expected.message;
    const pathMatches =
      expected.path === undefined ||
      pathsEqual(normalizeIssuePath(issue.path), expected.path);
    return messageMatches && pathMatches;
  });

  assert(match, `Expected issue was not found: ${JSON.stringify(expected)}`);
}
