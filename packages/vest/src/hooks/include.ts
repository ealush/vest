import { dynamicValue, invariant, isStringValue, makeBrand } from 'vest-utils';
import { IsolateTransient, type TIsolate } from 'vestjs-runtime';

import { useInclusion } from '../core/context/SuiteContext';
import { TIsolateTest } from '../core/isolate/IsolateTest/IsolateTest';
import { ErrorStrings } from '../errors/ErrorStrings';
import { TDraftCondition } from '../suite/getTypedMethods';
import { TFieldName, TGroupName } from '../suiteResult/SuiteResultTypes';
import { useCreateSuiteResult } from '../suiteResult/suiteResult';
import { LazyDraft } from '../suiteResult/selectors/LazyDraft';

import { useHasOnliedTests } from './focused/useHasOnliedTests';

const INCLUDE_UNSET = Symbol('include_unset');

/**
 * Conditionally includes a field for testing, based on specified criteria.
 *
 * @param {string} fieldName - The name of the field to include for testing.
 *
 * @example
 * include('confirm').when('password');
 * // Includes the "confirm" field for testing when the "password" field is included
 *
 * include('confirm').when(someValue);
 * // Includes the "confirm" field for testing when the value of `someValue` is true
 *
 * include('confirm').when(() => someValue);
 * // Includes the "confirm" field for testing when the callback function returns true
 *
 * include('username').when(result => result.hasErrors('username'));
 * // Includes the "username" field for testing when there are errors associated with it in the current suite result
 */
// @vx-allow use-use
export function include<F extends TFieldName, G extends TGroupName>(
  fieldName: F | string,
): {
  when: (condition: F | string | TFieldName | TDraftCondition<F, G>) => void;
} {
  invariant(isStringValue(fieldName));
  const safeFieldName = makeBrand<TFieldName>(fieldName);
  const conditionRef: IncludeConditionRef<F, G> = {
    current: INCLUDE_UNSET,
  };

  IsolateTransient(useSetIncluded, 'Include', {
    conditionRef,
    fieldName: safeFieldName,
  });

  return { when };

  /**
   * Specifies the inclusion criteria for the field in `include` function.
   */
  function when(
    condition: F | string | TFieldName | TDraftCondition<F, G>,
  ): void {
    invariant(condition !== fieldName, ErrorStrings.INCLUDE_SELF);

    conditionRef.current = condition;
  }
}

type IncludeCondition<F extends TFieldName, G extends TGroupName> =
  | F
  | string
  | TFieldName
  | TDraftCondition<F, G>;

type IncludeConditionRef<F extends TFieldName, G extends TGroupName> = {
  current: IncludeCondition<F, G> | typeof INCLUDE_UNSET;
};

type IncludePayload<F extends TFieldName, G extends TGroupName> = {
  conditionRef: IncludeConditionRef<F, G>;
  fieldName: TFieldName;
};

function useSetIncluded<F extends TFieldName, G extends TGroupName>(
  isolate: TIsolate<IncludePayload<F, G>>,
): void {
  const inclusion = useInclusion();
  const { fieldName, conditionRef } = isolate.data;

  // This callback will run as part of the "isExcluded" series of checks
  inclusion[fieldName] = function isIncluded(
    currentNode: TIsolateTest,
  ): boolean {
    const condition = conditionRef.current;

    if (condition === INCLUDE_UNSET) {
      return true;
    }

    if (isStringValue(condition)) {
      return useHasOnliedTests(currentNode, makeBrand<TFieldName>(condition));
    }

    return dynamicValue(
      condition,
      LazyDraft<F, G>(),
      currentNode,
    );
  };
}
