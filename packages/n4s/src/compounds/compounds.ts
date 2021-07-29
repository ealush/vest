import allOf from 'allOf';
import anyOf from 'anyOf';
import noneOf from 'noneOf';
import oneOf from 'oneOf';
import optional from 'optional';

export default function compounds() {
  return { allOf, anyOf, noneOf, oneOf, optional };
}

export type TCompounds = ReturnType<typeof compounds>;
