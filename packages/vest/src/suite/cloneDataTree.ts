import { isArray, isObject } from 'vest-utils';

/**
 * Copies data containers without relying on JSON serialization, preserving
 * undefined values, symbols, cycles, prototypes, and property descriptors.
 * Immutable copies reject mutation through built-in collection/date methods,
 * whose internal slots are not protected by Object.freeze alone.
 */
// eslint-disable-next-line complexity, max-lines-per-function, max-statements -- preserves each supported JavaScript container type
export function cloneDataTree(
  data: unknown,
  immutable = false,
  seen = new WeakMap<object, unknown>(),
): unknown {
  if (!isObject(data)) return data;

  const existing = seen.get(data);
  if (existing !== undefined) return existing;

  if (data instanceof Date) {
    const copy = new Date(data.getTime());
    if (!immutable) {
      seen.set(data, copy);
      return copy;
    }
    const snapshot = immutableBuiltin(copy, DateMutators);
    seen.set(data, snapshot);
    return snapshot;
  }
  if (data instanceof RegExp) {
    const copy = new RegExp(data.source, data.flags);
    copy.lastIndex = data.lastIndex;
    seen.set(data, copy);
    return immutable ? Object.freeze(copy) : copy;
  }
  if (data instanceof Map) {
    const copy = new Map<unknown, unknown>();
    const output = immutable ? immutableBuiltin(copy, MapMutators) : copy;
    seen.set(data, output);
    for (const [key, value] of data) {
      copy.set(
        cloneDataTree(key, immutable, seen),
        cloneDataTree(value, immutable, seen),
      );
    }
    return output;
  }
  if (data instanceof Set) {
    const copy = new Set<unknown>();
    const output = immutable ? immutableBuiltin(copy, SetMutators) : copy;
    seen.set(data, output);
    for (const value of data) {
      copy.add(cloneDataTree(value, immutable, seen));
    }
    return output;
  }

  const copy: Record<PropertyKey, unknown> | unknown[] = isArray(data)
    ? []
    : Object.create(Object.getPrototypeOf(data));
  seen.set(data, copy);
  for (const key of Reflect.ownKeys(data)) {
    const descriptor = Object.getOwnPropertyDescriptor(data, key);
    if (descriptor === undefined) continue;
    if ('value' in descriptor) {
      descriptor.value = cloneDataTree(descriptor.value, immutable, seen);
    }
    Object.defineProperty(copy, key, descriptor);
  }
  return immutable ? Object.freeze(copy) : copy;
}

const DateMutators = new Set<PropertyKey>([
  'setDate',
  'setFullYear',
  'setHours',
  'setMilliseconds',
  'setMinutes',
  'setMonth',
  'setSeconds',
  'setTime',
  'setUTCDate',
  'setUTCFullYear',
  'setUTCHours',
  'setUTCMilliseconds',
  'setUTCMinutes',
  'setUTCMonth',
  'setUTCSeconds',
  'setYear',
]);
const MapMutators = new Set<PropertyKey>(['clear', 'delete', 'set']);
const SetMutators = new Set<PropertyKey>(['add', 'clear', 'delete']);

function immutableBuiltin<T extends object>(
  target: T,
  mutators: ReadonlySet<PropertyKey>,
): T {
  const rejectMutation = (): never => {
    throw new TypeError('Cannot mutate a parsed-data snapshot');
  };
  Object.freeze(target);
  return new Proxy(target, {
    defineProperty: rejectMutation,
    deleteProperty: rejectMutation,
    get(current, property) {
      if (mutators.has(property)) return rejectMutation;
      const value = Reflect.get(current, property, current);
      return typeof value === 'function' && property !== 'constructor'
        ? value.bind(current)
        : value;
    },
    set: rejectMutation,
    setPrototypeOf: rejectMutation,
  });
}
