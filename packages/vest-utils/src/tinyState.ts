import dynamicValue from './dynamicValue';
import { DynamicValue } from './utilityTypes';

export function createTinyState<S>(
  initialValue: SetValueInput<S>,
): TinyState<S> {
  let value: S;

  resetValue();

  return () => [value, setValue, resetValue];

  function setValue(nextValue: SetValueInput<S>) {
    value = dynamicValue(nextValue, value);
  }

  function resetValue() {
    setValue(dynamicValue(initialValue));
  }
}

export type TinyState<S> = () => [
  value: S,
  setValue: (next: SetValueInput<S>) => void,
  resetValue: () => void,
];

type SetValueInput<S> = DynamicValue<S, [prev: S]>;
