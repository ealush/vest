import { StandardSchemaV1 } from 'vest-utils/standardSchemaSpec';

import { InferSchemaData, TSchema } from '../suiteResult/SuiteResultTypes';

export function getStandardSchema<S extends TSchema = undefined>(
  staticRunner: any,
): StandardSchemaV1.Props<InferSchemaData<S>, InferSchemaData<S>> {
  return {
    types: undefined,
    validate: (value: unknown) => {
      const result = staticRunner(value);
      if (!result.hasErrors()) {
        return { value: value as InferSchemaData<S> };
      }
      return {
        issues: result.errors.map(toStandardIssue),
      };
    },
    vendor: 'vest',
    version: 1,
  };
}

function toStandardIssue(error: any) {
  const issue: any = { path: getIssuePath(error) };
  if (error.message !== undefined) issue.message = error.message;
  if (error.code !== undefined) issue.code = error.code;
  if (error.meta !== undefined) issue.meta = error.meta;
  return issue;
}

function getIssuePath(error: any) {
  if (error.path !== undefined) return error.path;
  if (error.fieldName === undefined) return undefined;
  return error.fieldName.split('.');
}
