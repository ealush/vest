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

      if (result.isPending?.()) {
        return Promise.resolve(result).then(completedResult =>
          toStandardSchemaResult<S>(completedResult, value),
        );
      }

      return toStandardSchemaResult<S>(result, value);
    },
    vendor: 'vest',
    version: 1,
  };
}

function toStandardSchemaResult<S extends TSchema = undefined>(
  result: any,
  input: unknown,
): StandardSchemaV1.Result<InferSchemaOutput<S>> {
  if (!result.hasErrors()) {
    return { value: getStandardSchemaValue<S>(result, input) };
  }

  return {
    issues: result.errors.map((error: any) => ({
      message:
        typeof error.message === 'string' ? error.message : 'Validation failed',
      path: error.fieldName ? error.fieldName.split('.') : undefined,
    })),
  };
}

function getStandardSchemaValue<S extends TSchema = undefined>(
  result: any,
  input: unknown,
): InferSchemaOutput<S> {
  if ('value' in result) {
    return result.value as InferSchemaOutput<S>;
  }

  // A schema can successfully parse without producing any Vest tests. In that
  // case the SuiteResult is neutral (`valid: null`), but the parsed Standard
  // Schema output is still available in the run metadata.
  if (result.types !== undefined) {
    return result.run?.data?.parsed as InferSchemaOutput<S>;
  }

  return input as InferSchemaOutput<S>;
}
