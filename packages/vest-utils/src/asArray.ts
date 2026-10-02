export default function asArray<T>(possibleArg: T | readonly T[]): T[] {
  return ([] as T[]).concat(possibleArg);
}
