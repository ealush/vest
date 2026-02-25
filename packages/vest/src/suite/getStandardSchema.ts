import { StandardSchemaV1 } from 'vest-utils/standardSchemaSpec';

import {
  InferSchemaData,
  InferSchemaOutput,
  TSchema,
} from '../suiteResult/SuiteResultTypes';

export function getStandardSchema<S extends TSchema = undefined>(
  staticRunner: any,
): StandardSchemaV1.Props<InferSchemaData<S>, InferSchemaOutput<S>> {
  return {
    types: undefined,
    validate: (value: unknown) => {
      const result = staticRunner(value);
      if (!result.hasErrors()) {
        return { value: (result.value ?? value) as InferSchemaOutput<S> };
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
