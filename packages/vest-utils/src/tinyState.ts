import optionalFunctionValue from 'optionalFunctionValue';

export function createTinyState<S>(initialValue: S | (() => S)): TinyState<S> {
  let value: S;

  resetValue();

  return () => [value, setValue, resetValue];

  function setValue(nextValue: S | ((currentValue: S) => S)) {
    value = optionalFunctionValue(nextValue, value);
  }

  function resetValue() {
    setValue(optionalFunctionValue(initialValue));
  }
}

export type TinyState<S> = () => [
  value: S,
  setValue: (next: S | ((prev: S) => S)) => void,
  resetValue: () => void
];
