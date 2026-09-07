import { hasOwnProperty, isArray, isObject } from 'vest-utils';

/**
 * Copies supported data containers without relying on JSON serialization,
 * preserving undefined values, symbols, cycles, and property descriptors.
 * Immutable copies reject mutation through built-in collection/date methods,
 * whose internal slots are not protected by Object.freeze alone. Opaque class
 * instances are retained by identity because cloning their visible properties
 * cannot recreate private fields or other internal slots.
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
    const output = immutable ? immutableBuiltin(copy, DateMutators) : copy;
    seen.set(data, output);
    copyOwnDescriptors(data, copy, immutable, seen);
    if (immutable) Object.freeze(copy);
    return output;
  }
  if (data instanceof RegExp) {
    const copy = new RegExp(data.source, data.flags);
    copy.lastIndex = data.lastIndex;
    seen.set(data, copy);
    copyOwnDescriptors(data, copy, immutable, seen);
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
    copyOwnDescriptors(data, copy, immutable, seen);
    if (immutable) Object.freeze(copy);
    return output;
  }
  if (data instanceof Set) {
    const copy = new Set<unknown>();
    const output = immutable ? immutableBuiltin(copy, SetMutators) : copy;
    seen.set(data, output);
    for (const value of data) {
      copy.add(cloneDataTree(value, immutable, seen));
    }
    copyOwnDescriptors(data, copy, immutable, seen);
    if (immutable) Object.freeze(copy);
    return output;
  }
  if (data instanceof ArrayBuffer) {
    const copy = data.slice(0);
    seen.set(data, copy);
    copyOwnDescriptors(data, copy, immutable, seen);
    return copy;
  }
  if (ArrayBuffer.isView(data)) {
    const copy = cloneArrayBufferView(data);
    seen.set(data, copy);
    copyOwnDescriptors(data, copy, immutable, seen);
    return copy;
  }
  if (!isArray(data) && !isPlainDataObject(data)) {
    seen.set(data, data);
    return data;
  }

  const copy: Record<PropertyKey, unknown> | unknown[] = isArray(data)
    ? []
    : Object.create(Object.getPrototypeOf(data));
  seen.set(data, copy);
  copyOwnDescriptors(data, copy, immutable, seen);
  return immutable ? Object.freeze(copy) : copy;
}

function copyOwnDescriptors(
  source: object,
  target: object,
  immutable: boolean,
  seen: WeakMap<object, unknown>,
): void {
  for (const key of Reflect.ownKeys(source)) {
    const descriptor = Object.getOwnPropertyDescriptor(source, key);
    if (descriptor === undefined) continue;
    if ('value' in descriptor) {
      descriptor.value = cloneDataTree(descriptor.value, immutable, seen);
    }
    Object.defineProperty(target, key, descriptor);
  }
}

function isPlainDataObject(data: object): boolean {
  const prototype = Object.getPrototypeOf(data);
  return prototype === Object.prototype || prototype === null;
}

function cloneArrayBufferView(view: ArrayBufferView): ArrayBufferView {
  const bytes = new Uint8Array(view.byteLength);
  bytes.set(new Uint8Array(view.buffer, view.byteOffset, view.byteLength));
  if (view instanceof DataView) return new DataView(bytes.buffer);
  return Reflect.construct(view.constructor, [bytes.buffer]) as ArrayBufferView;
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
  return new Proxy(target, {
    defineProperty: rejectMutation,
    deleteProperty: rejectMutation,
    get(current, property) {
      if (mutators.has(property)) return rejectMutation;
      const value = Reflect.get(current, property, current);
      if (hasOwnProperty(current, property)) return value;
      return typeof value === 'function' && property !== 'constructor'
        ? value.bind(current)
        : value;
    },
    set: rejectMutation,
    setPrototypeOf: rejectMutation,
  });
}
