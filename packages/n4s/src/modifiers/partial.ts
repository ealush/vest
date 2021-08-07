import enforce from 'enforce';

// Help needed improving the typings of this file.
// Ideally, we'd be able to extend TShapeObject, but that's not possible.
export default function partial<T extends Record<any, any>>(shapeObject: T): T {
  const output = {} as T;
  for (const key in shapeObject) {
    output[key] = enforce.optional(shapeObject[key]) as T[Extract<
      keyof T,
      string
    >];
  }

  return output;
}
