import type { StandardSchemaV1 } from '@standard-schema/spec';

import { accountSchema, accountSuite } from './suite';

export type ValidationDisplay =
  | { success: true; value: unknown }
  | {
      success: false;
      issues: Array<{ message: string; path: PropertyKey[] }>;
    };

export const validators = {
  'Vest suite': accountSuite,
  'Enforce schema': accountSchema,
} satisfies Record<string, StandardSchemaV1>;

export async function validateJson(
  validator: StandardSchemaV1,
  source: string,
): Promise<ValidationDisplay> {
  let input: unknown;
  try {
    input = JSON.parse(source);
  } catch {
    return {
      success: false,
      issues: [{ message: 'Input is not valid JSON', path: [] }],
    };
  }

  const result = await validator['~standard'].validate(input);
  if (result.issues) {
    return {
      success: false,
      issues: result.issues.map(issue => ({
        message: issue.message,
        path: (issue.path ?? []).map(segment =>
          typeof segment === 'object' ? segment.key : segment,
        ),
      })),
    };
  }

  return { success: true, value: result.value };
}
