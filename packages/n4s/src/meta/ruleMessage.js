import EnforceContext from 'EnforceContext';
import optionalFunctionValue from 'optionalFunctionValue';

export default function message(value, msg) {
  return optionalFunctionValue(msg, [EnforceContext.unwrap(value)]);
}
