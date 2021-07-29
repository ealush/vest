import enforce from 'enforce';
import type { TLazy, TShapeObject } from 'genEnforceLazy';

export default function partial(
  shapeObject: TShapeObject
): Record<string, TLazy> {
  const output: Record<string, TLazy> = {};
  for (const key in shapeObject) {
    output[key] = enforce.optional(shapeObject[key]);
  }

  return output;
}
