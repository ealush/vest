import optionalFunctionValue from 'optionalFunctionValue';

export function createTinyState<S>(
  initialValue: S | (() => S)
): () => [S, (next: S | ((prev: S) => S)) => void] {
  let value: S = optionalFunctionValue(initialValue);

  return () => [
    value,
    (nextValue: S | ((currentValue: S) => S)) => {
      value = optionalFunctionValue(nextValue, value);
    },
  ];
}
