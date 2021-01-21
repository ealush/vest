import EnforceContext from 'EnforceContext';
import optionalFunctionValue from 'optionalFunctionValue';

export default function when(value, condition, bail) {
  const shouldBail = !optionalFunctionValue(
    condition,
    [EnforceContext.unwrap(value)].concat(
      EnforceContext.is(value) ? [value.key, value.obj] : []
    )
  );

  return bail(shouldBail);
}
