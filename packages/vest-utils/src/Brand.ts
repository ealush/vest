// Utility for creating opaque branded types to avoid primitive mixing
// Brand is represented as an intersection type with a unique symbol index
// This pattern prevents accidental assignment between different domain primitives

// eslint-disable-next-line @typescript-eslint/ban-types
export type Brand<T, B> = T & { readonly __brand: B };

export function makeBrand<T extends Brand<any, any>>(value: unknown): T {
  return value as T;
}
