import { enforce } from 'n4s';

// Help needed improving the typings of this file.
// Ideally, we'd be able to extend IShapeObject, but that's not possible.
export function partial<T extends Record<any, any>>(shapeObject: T): T {
  const output = {} as T;
  for (const key in shapeObject) {
    output[key] = enforce.optional(shapeObject[key]) as T[Extract<
      keyof T,
      string
    >];
  }
  return output;
}
