import enforce from 'enforce';
import type { TShapeObject, TLazy } from 'genEnforceLazy';

export default function partial(shapeObject: TShapeObject): TShapeObject {
  const output: TShapeObject = {};
  for (const key in shapeObject) {
    output[key] = enforce.optional(shapeObject[key]) as TLazy;
  }

  return output;
}
