import isUnsafeKey from '../isUnsafeKey';
import { isArray } from '../isArrayValue';
import { isEmpty } from '../isEmpty';
import isFunction from '../isFunction';
import { isNullish } from '../isNullish';
import isStringValue from '../isStringValue';
import { isObject } from '../valueIsObject';

// Basic key generator that generates keys like a, b, c, ... aa, ab, ac, ...
function genMinifiedKey() {
  const chars =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*';
  let index = 0;

  return function next(): string {
    let code = '';
    let x = index;

    do {
      code = code + chars[x % chars.length];
      x = Math.floor(x / chars.length);
    } while (x > 0);
    index++;
    return code;
  };
}

export function minifyObject(
  obj: any,
  replacer: MinifyObjectReplacer = v => v,
): [any, any] {
  const countMap = new Map<any, number>();
  countOccurrences(obj, countMap, replacer);
  const maps = genMap(countMap);
  const o = minifyObjectImpl(obj, maps.map, replacer);
  // need to reverse the map so that the minified keys are the keys and the original keys are the values
  // and turn it into an object

  return [o, maps.reverseMap];
}

function genMap(countMap: Map<any, number>) {
  const counts = [];

  for (const [value, count] of countMap) {
    if (count > 1) {
      counts.push({ value, count });
    }
  }

  const sorted = counts.sort((a, z) => z.count - a.count);

  const getKey = genMinifiedKey();
  return sorted.reduce(
    (maps, { value }) => {
      if (!shouldAddToMap(value, maps.keyLength)) {
        return maps;
      }

      let key;
      do {
        key = getKey();
      } while (countMap.has(key));
      maps.map.set(value, key);
      maps.reverseMap[key] = value;
      maps.keyLength = key.length;
      return maps;
    },
    {
      map: new Map(),
      reverseMap: {},
      keyLength: 1,
    } as {
      map: Map<any, string>;
      reverseMap: Record<string, any>;
      keyLength: number;
    },
  );
}

// This avoids minification if the original key is shorter than or equals the minified key
function shouldAddToMap(value: any, keyLength: number) {
  return value.toString().length >= keyLength;
}

function addCount(value: any, countMap: Map<any, number>) {
  countMap.set(value, (countMap.get(value) || 0) + 1);
}

function countOccurrences(
  obj: any,
  countMap: Map<any, number>,
  replacer: MinifyObjectReplacer,
) {
  for (const key in obj) {
    const value = replacer(obj[key], key);
    if (!shouldMinify(value)) continue;

    if (!Array.isArray(obj)) {
      addCount(key, countMap);
    }

    if (isObject(value)) {
      countOccurrences(value, countMap, replacer);
    } else {
      addCount(value, countMap);
    }
  }
}

function isNonSerializable(value: any): boolean {
  return isNullish(value) || isFunction(value) || typeof value === 'symbol';
}

function shouldMinify(value: any): boolean {
  if (isObject(value) && isEmpty(value)) {
    return false;
  }

  if (isNonSerializable(value)) {
    return false;
  }

  return true;
}

function minifyObjectImpl(
  obj: any,
  map: Map<any, string>,
  replacer: MinifyObjectReplacer,
): any {
  const minifiedObject: any = getRootNode(obj);

  for (const key in obj) {
    const value = replacer(obj[key], key);
    if (!shouldMinify(value)) continue;

    let minifiedValue;
    if (isObject(value)) {
      minifiedValue = minifyObjectImpl(value, map, replacer);
    } else {
      minifiedValue = minifyValue(value, map);
    }

    setValue(minifiedObject, minifiedValue, minifyValue(key, map));
  }

  return minifiedObject;
}

function minifyValue(value: any, map: Map<any, string>) {
  return map.get(value) ?? value;
}

function expandSingle(value: any, map: Record<string, any>): any {
  if (isStringValue(value)) {
    return map[value] ?? value;
  }

  return value;
}

export function expandObject(minifiedObj: any, map: Record<string, any>): any {
  const expandedObject: any = getRootNode(minifiedObj);

  for (const key in minifiedObj) {
    let expandedValue;
    const value = minifiedObj[key];
    if (isObject(value)) {
      expandedValue = expandObject(value, map);
    } else {
      expandedValue = expandSingle(value, map);
    }

    const expandedKey = expandSingle(key, map);
    setValue(expandedObject, expandedValue, expandedKey);
  }

  return expandedObject;
}

function setValue(container: any, value: any, key: string) {
  if (isUnsafeKey(key)) {
    return;
  }

  if (isArray(container)) {
    container.push(value);
  } else {
    container[key] = value;
  }
}

function getRootNode(node: any) {
  return isArray(node) ? [] : {};
}

export type MinifyObjectReplacer = (value: any, key: string) => any;
