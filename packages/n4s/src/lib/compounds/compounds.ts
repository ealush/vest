import allOf from 'allOf';
import anyOf from 'anyOf';
import noneOf from 'noneOf';
import oneOf from 'oneOf';

export default function compounds() {
  return { allOf, anyOf, noneOf, oneOf };
}

export type TCompounds = ReturnType<typeof compounds>;
