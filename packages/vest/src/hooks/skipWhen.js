import isFunction from 'isFunction';
import { isFalsy } from 'isTruthy';
import optionalFunctionValue from 'optionalFunctionValue';

// This function by itself doesn't do much, and is only a wrapper around
// an if statement. The reason for it is to support version 4 api in version 3
// so that someone reading the latest docs can still run the code.

export default function skipWhen(conditional, callback) {
  if (isFalsy(optionalFunctionValue(conditional))) {
    if (isFunction(callback)) {
      callback();
    }
  }
}
