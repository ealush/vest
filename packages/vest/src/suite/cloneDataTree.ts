import { hasOwnProperty, isArray, isNullish, isObject } from 'vest-utils';

/**
 * Copies supported data containers without relying on JSON serialization,
 * preserving undefined values, symbols, cycles, and property descriptors.
 * Immutable copies reject mutation through built-in collection/date methods,
 * whose internal slots are not protected by Object.freeze alone. Opaque class
 * instances are retained by identity because cloning their visible properties
 * cannot recreate private fields or other internal slots. Accessor
 * properties of immutable snapshots are read once and stored as detached
 * working copies (see detachAccessor): the snapshot must not alias a live
 * foreign-owned object.
 */
// eslint-disable-next-line complexity, max-lines-per-function, max-statements -- preserves each supported JavaScript container type
export function cloneDataTree(
  data: unknown,
  immutable = false,
  seen = new WeakMap<object, unknown>(),
  detachAccessors = false,
): unknown {
  if (!isObject(data)) return data;

  const existing = seen.get(data);
  if (existing !== undefined) return existing;

  if (data instanceof Date) {
    const copy = new Date(data.getTime());
    const output = immutable ? immutableBuiltin(copy, DateMutators) : copy;
    seen.set(data, output);
    copyOwnDescriptors(data, copy, immutable, seen, detachAccessors);
    if (immutable) Object.freeze(copy);
    return output;
  }
  if (data instanceof RegExp) {
    const copy = new RegExp(data.source, data.flags);
    copy.lastIndex = data.lastIndex;
    seen.set(data, copy);
    copyOwnDescriptors(data, copy, immutable, seen, detachAccessors);
    return immutable ? Object.freeze(copy) : copy;
  }
  if (data instanceof Map) {
    const copy = new Map<unknown, unknown>();
    const output = immutable ? immutableBuiltin(copy, MapMutators) : copy;
    seen.set(data, output);
    for (const [key, value] of data) {
      copy.set(
        cloneDataTree(key, immutable, seen, detachAccessors),
        cloneDataTree(value, immutable, seen, detachAccessors),
      );
    }
    copyOwnDescriptors(data, copy, immutable, seen, detachAccessors);
    if (immutable) Object.freeze(copy);
    return output;
  }
  if (data instanceof Set) {
    const copy = new Set<unknown>();
    const output = immutable ? immutableBuiltin(copy, SetMutators) : copy;
    seen.set(data, output);
    for (const value of data) {
      copy.add(cloneDataTree(value, immutable, seen, detachAccessors));
    }
    copyOwnDescriptors(data, copy, immutable, seen, detachAccessors);
    if (immutable) Object.freeze(copy);
    return output;
  }
  if (isBackingBuffer(data)) {
    const copy = data.slice(0);
    seen.set(data, copy);
    copyOwnDescriptors(data, copy, immutable, seen, detachAccessors);
    return copy;
  }
  if (ArrayBuffer.isView(data)) {
    const copy = cloneArrayBufferView(data, immutable, seen, detachAccessors);
    copyOwnDescriptors(data, copy, immutable, seen, detachAccessors);
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
  copyOwnDescriptors(data, copy, immutable, seen, detachAccessors);
  return immutable ? Object.freeze(copy) : copy;
}

function copyOwnDescriptors(
  source: object,
  target: object,
  immutable: boolean,
  seen: WeakMap<object, unknown>,
  detachAccessors: boolean,
): void {
  for (const key of Reflect.ownKeys(source)) {
    const descriptor = Object.getOwnPropertyDescriptor(source, key);
    if (descriptor === undefined) continue;
    if ('value' in descriptor) {
      descriptor.value = cloneDataTree(
        descriptor.value,
        immutable,
        seen,
        detachAccessors,
      );
      Object.defineProperty(target, key, descriptor);
      continue;
    }
    copyAccessorDescriptor(
      source,
      target,
      key,
      descriptor,
      immutable,
      seen,
      detachAccessors,
    );
  }
}

function copyAccessorDescriptor(
  source: object,
  target: object,
  key: PropertyKey,
  descriptor: PropertyDescriptor,
  immutable: boolean,
  seen: WeakMap<object, unknown>,
  detachAccessors: boolean,
): void {
  const detached =
    immutable || detachAccessors
      ? detachAccessor(source, descriptor, seen, detachAccessors)
      : null;
  Object.defineProperty(target, key, detached ?? descriptor);
}

/**
 * Snapshot detachment for accessor properties: invokes the getter once and
 * stores the result as a detached working copy, so mutating the snapshot
 * never reaches the foreign-owned live object. The copy stays mutable —
 * unlike data-descriptor subtrees, which freeze: a live read is handed over
 * as usable detached state, not snapshot-owned structure. A throwing getter
 * propagates: the snapshot must fail explicitly instead of retaining a live
 * closure over foreign state. Setter-only properties (nothing to read)
 * become read-only undefined: snapshot writes must never invoke the original
 * setter. Accessors of mutable working clones are preserved as-is.
 */
function detachAccessor(
  source: object,
  descriptor: PropertyDescriptor,
  seen: WeakMap<object, unknown>,
  detachAccessors: boolean,
): PropertyDescriptor | null {
  const getter = descriptor.get;
  if (isNullish(getter)) {
    return {
      configurable: descriptor.configurable,
      enumerable: descriptor.enumerable,
      value: undefined,
      writable: false,
    };
  }
  const value = getter.call(source);
  return {
    configurable: descriptor.configurable,
    enumerable: descriptor.enumerable,
    value: cloneDataTree(value, false, seen, detachAccessors),
    writable: true,
  };
}

/**
 * Detached working copy for public schema boundaries (suite callback data,
 * retained mappings, result output). Materializes ordinary getters once and
 * clones their values through the same reference memo, drops foreign
 * setters (setter-only becomes read-only undefined), and preserves cycles,
 * symbols, and descriptor presence — without freezing, so local mutation of
 * the owned copy stays possible. Throwing getters propagate instead of
 * retaining a live closure. Planning stays getter-free (see
 * `resolveAffectedPaths`); this runs only at deliberate copy boundaries.
 */
export function cloneDetachedDataTree(data: unknown): unknown {
  return cloneDataTree(data, false, new WeakMap(), true);
}

function isPlainDataObject(data: object): boolean {
  const prototype = Object.getPrototypeOf(data);
  return prototype === Object.prototype || prototype === null;
}

function cloneArrayBufferView(
  view: ArrayBufferView,
  immutable: boolean,
  seen: WeakMap<object, unknown>,
  detachAccessors: boolean,
): ArrayBufferView {
  // Allocate and register both ends before copying descriptors: the buffer
  // may itself point back to this view, including during view-first traversal.
  const existing = seen.get(view.buffer) as ArrayBufferLike | undefined;
  const buffer = existing ?? view.buffer.slice(0);
  if (existing === undefined) seen.set(view.buffer, buffer);
  const copy = constructBufferView(view, buffer);
  seen.set(view, copy);
  if (existing === undefined) {
    copyOwnDescriptors(view.buffer, buffer, immutable, seen, detachAccessors);
  }
  return copy;
}

function isBackingBuffer(
  data: object,
): data is ArrayBuffer | SharedArrayBuffer {
  return (
    data instanceof ArrayBuffer ||
    (typeof SharedArrayBuffer !== 'undefined' &&
      data instanceof SharedArrayBuffer)
  );
}

function constructBufferView(
  view: ArrayBufferView,
  buffer: ArrayBufferLike,
): ArrayBufferView {
  if (view instanceof DataView) {
    return new DataView(buffer, view.byteOffset, view.byteLength);
  }
  const { length } = view as ArrayBufferView & { length: number };
  return Reflect.construct(view.constructor, [
    buffer,
    view.byteOffset,
    length,
  ]) as ArrayBufferView;
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
  const snapshot = new Proxy(target, {
    defineProperty: rejectMutation,
    deleteProperty: rejectMutation,
    get(current, property) {
      if (mutators.has(property)) return rejectMutation;
      return readSnapshotProperty(current, property, snapshot);
    },
    set: rejectMutation,
    setPrototypeOf: rejectMutation,
  });
  return snapshot;
}

function readSnapshotProperty<T extends object>(
  current: T,
  property: PropertyKey,
  snapshot: T,
): unknown {
  const value = Reflect.get(current, property, current);
  if (
    hasOwnProperty(current, property) ||
    typeof value !== 'function' ||
    property === 'constructor'
  ) {
    return value;
  }
  if (isCollectionForEach(current, property)) {
    return (
      callback: (value: unknown, key: unknown, collection: T) => void,
      thisArg?: unknown,
    ) => {
      if (typeof callback !== 'function')
        return value.call(current, callback, thisArg);
      return value.call(current, (entry: unknown, key: unknown) =>
        callback.call(thisArg, entry, key, snapshot),
      );
    };
  }
  // Object.valueOf returns its receiver. Never expose the mutable backing object.
  return (...args: unknown[]) => {
    const result = value.apply(current, args);
    return result === current ? snapshot : result;
  };
}

function isCollectionForEach(value: object, property: PropertyKey): boolean {
  return (
    property === 'forEach' && (value instanceof Map || value instanceof Set)
  );
}
