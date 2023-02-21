import { CB, invariant, isFunction } from 'vest-utils';

export function validateSuiteCallback<T extends CB>(
  suiteCallback: T
): asserts suiteCallback is T {
  invariant(
    isFunction(suiteCallback),
    'vest.create: Expected callback to be a function.'
  );
}
