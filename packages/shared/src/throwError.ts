/**
 * Throws a timed out error.
 */
export default function throwError(
  message: string,
  type: ErrorConstructor = Error
): never {
  throw new type(message);
}
