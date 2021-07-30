import enforce from 'enforce';
import type { TShapeObject } from 'genEnforceLazy';

export default function partial(shapeObject: TShapeObject): TShapeObject {
  const output: TShapeObject = {};
  for (const key in shapeObject) {
    // @ts-expect-error - This is pretty tricky to get right. Everything works, but ts still doesn't like it
    output[key] = enforce.optional(shapeObject[key]);
  }

  return output;
}
