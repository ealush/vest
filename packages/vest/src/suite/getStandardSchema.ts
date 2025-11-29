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
        issues: result.errors.map((error: any) => ({
          message: error.message,
          path: error.fieldName ? error.fieldName.split('.') : undefined,
        })),
      };
    },
    vendor: 'vest',
    version: 1,
  };
}
