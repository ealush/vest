import { parseAffectedFieldName } from 'n4s/exports/internal';
import type { SelectiveSchemaResult } from 'n4s/exports/internal';
import { hasOwnProperty, isArray, isObject, isUnsafeKey } from 'vest-utils';

import { cloneDataTree, cloneDetachedDataTree } from './cloneDataTree';

type Path = readonly (string | number)[];

/**
 * Publishes output from this execution only. Projection can preserve raw
 * siblings in its working value; copying selected paths prevents those
 * siblings from becoming typed output. No parser or validator runs here.
 * `selected` null means the whole schema ran.
 */
export function schemaOutput(
  results: readonly SelectiveSchemaResult[] | undefined,
  selected: readonly string[] | null,
  skipped: readonly string[] | null,
  skipAll: boolean,
): unknown {
  const first = passingResult(results);
  if (skipAll || first === null) return {};
  const output = (skipped ?? []).reduce(
    (current, field) => omitPath(current, concretePath(field)),
    selectedOutput(first.type, selected),
  );
  return cloneDetachedDataTree(output);
}

function selectedOutput(
  type: unknown,
  selected: readonly string[] | null,
): unknown {
  if (selected === null) return cloneDataTree(type);
  return selected.reduce<unknown>(
    (current, field) => copyPath(current, type, concretePath(field)),
    {},
  );
}

function passingResult(
  results: readonly SelectiveSchemaResult[] | undefined,
): SelectiveSchemaResult | null {
  if (!results?.length || results.some(result => !result.pass)) return null;
  return hasOwnProperty(results[0], 'type') ? results[0] : null;
}

/**
 * Applies this run's established output onto a detached copy of the
 * supplied input. Output positions absent from the run (holes, missing
 * properties) keep their supplied value; nothing is parsed here.
 */
export function applySchemaOutput(input: unknown, output: unknown): unknown {
  if (!sameContainerKind(input, output)) return output;
  const target = shallowCopy(input as object);
  for (const key of Object.keys(output as object)) {
    if (isUnsafeKey(key)) continue;
    defineValue(
      target,
      key,
      applySchemaOutput(
        ownValue(target, key),
        (output as Record<string, unknown>)[key],
      ),
    );
  }
  return target;
}

function sameContainerKind(input: unknown, output: unknown): boolean {
  return (
    isObject(input) && isObject(output) && isArray(input) === isArray(output)
  );
}

function concretePath(field: string): Path {
  return parseAffectedFieldName(field).map(segment =>
    segment.type === 'property'
      ? String(segment.key)
      : itemSegment(String(segment.binding)),
  );
}

// Record keys that are not canonical indices must keep their exact spelling.
function itemSegment(binding: string): string | number {
  const index = Number(binding);
  return Number.isSafeInteger(index) && String(index) === binding
    ? index
    : binding;
}

function copyPath(target: unknown, source: unknown, path: Path): unknown {
  if (path.length === 0) return cloneDataTree(source);
  const [key, ...tail] = path;
  if (!isReadableKey(source, key)) return target;
  const next = copyPath(
    ownValue(target, key),
    (source as Record<PropertyKey, unknown>)[key],
    tail,
  );
  const copy = isArray(source)
    ? isArray(target)
      ? target.slice()
      : new Array(source.length)
    : copyObject(target);
  defineValue(copy, key, next);
  return copy;
}

function omitPath(value: unknown, path: Path): unknown {
  if (path.length === 0) return {};
  const [key, ...tail] = path;
  if (!isReadableKey(value, key)) return value;
  const copy = shallowCopy(value as object);
  if (tail.length === 0) Reflect.deleteProperty(copy, key);
  else defineValue(copy, key, omitPath(ownValue(value, key), tail));
  return copy;
}

function isReadableKey(value: unknown, key: string | number): boolean {
  if (typeof key === 'string' && isUnsafeKey(key)) return false;
  return isObject(value) && hasOwnProperty(value, key);
}

function ownValue(value: unknown, key: PropertyKey): unknown {
  if (!isObject(value)) return undefined;
  const descriptor = Object.getOwnPropertyDescriptor(value, key);
  return descriptor && 'value' in descriptor ? descriptor.value : undefined;
}

function shallowCopy(value: object): object {
  return isArray(value) ? value.slice() : copyObject(value);
}

function copyObject(value: unknown): object {
  return Object.defineProperties(
    {},
    isObject(value) ? Object.getOwnPropertyDescriptors(value) : {},
  );
}

function defineValue(target: object, key: PropertyKey, value: unknown): void {
  Object.defineProperty(target, key, {
    configurable: true,
    enumerable: true,
    value,
    writable: true,
  });
}
