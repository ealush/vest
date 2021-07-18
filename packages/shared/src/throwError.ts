/**
 * Throws a timed out error.
 */
export default function throwError(
  devMessage?: string,
  productionMessage?: string | null
): never {
  throw new Error(__DEV__ ? devMessage : productionMessage ?? devMessage);
}
