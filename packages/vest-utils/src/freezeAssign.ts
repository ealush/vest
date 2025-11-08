import assign from 'assign';

export function freezeAssign<T extends object>(...args: Partial<T>[]): T {
  return Object.freeze(assign(...(args as [Partial<T>])));
}
