import { isArray } from 'isArrayValue';
import { isObject } from 'valueIsObject';

type MiniMap = Record<string, string>;

function countValues(obj: any): Record<string, number> {
  const counts: Record<string, number> = {};

  function count(obj: any) {
    if (isObject(obj)) {
      for (const value of Object.values(obj)) {
        count(value);
      }
    } else if (isArray(obj)) {
      for (const item of obj) {
        count(item);
      }
    } else {
      counts[obj] = (counts[obj] || 0) + 1;
    }
  }

  count(obj);

  return counts;
}

function alphanumericCounter() {
  const chars =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!?|~@#$%^&*';
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

export function minifyObject(obj: any) {
  const valueCounts = countValues(obj);
  const [minifiedObj, minifiedMap] = minifyObjectImpl(
    obj,
    {},
    alphanumericCounter(),
    valueCounts,
  );
  const invertedMap = invertMap(minifiedMap);
  return { s: minifiedObj, m: invertedMap };
}

// eslint-disable-next-line max-statements
function minifyObjectImpl(
  obj: any,
  minifiedMap: MiniMap = {},
  count: () => string,
  valueCounts: Record<string, number>,
): [any, MiniMap] {
  if (!isObject(obj)) {
    const minifiedValue = minify(obj, minifiedMap, count, valueCounts);
    return [minifiedValue, minifiedMap];
  }

  if (isArray(obj)) {
    const minifiedArray = obj.map(item => {
      const [minifiedValue, newMinifiedMap] = minifyObjectImpl(
        item,
        minifiedMap,
        count,
        valueCounts,
      );
      minifiedMap = newMinifiedMap;
      return minifiedValue;
    });

    return [minifiedArray, minifiedMap];
  }

  const minifiedObject: any = {};

  for (const [key, value] of Object.entries(obj)) {
    const minifiedKey = minify(key, minifiedMap, count, valueCounts);

    const [minifiedValue, newMinifiedMap] = minifyObjectImpl(
      value,
      minifiedMap,
      count,
      valueCounts,
    );
    minifiedMap = newMinifiedMap;
    minifiedObject[minifiedKey] = minifiedValue;
  }

  return [minifiedObject, minifiedMap];
}

function invertMap(map: MiniMap) {
  const invertedMap: MiniMap = {};
  for (const [key, value] of Object.entries(map)) {
    invertedMap[value] = key;
  }
  return invertedMap;
}

function minify(
  item: any,
  minifiedMap: MiniMap,
  count: () => string,
  valueCounts: Record<string, number>,
) {
  let minified: string;

  if (item in minifiedMap) {
    minified = minifiedMap[item];
  } else if (valueCounts[item] === 1) {
    minified = '_' + item;
  } else {
    minified = count();
    minifiedMap[item] = minified;
  }

  return minified;
}

export function expandObject({ s, m }: { s: any; m: MiniMap }): any {
  if (!isObject(s)) {
    return expand(s, m);
  }

  const expandedObject: any = isArray(s) ? [] : {};

  for (const [key, value] of Object.entries(s)) {
    const expandedKey = expand(key, m);
    const expandedValue = isObject(value)
      ? expandObject({ s: value, m })
      : expand(value, m);
    expandedObject[expandedKey] = expandedValue;
  }

  return expandedObject;
}

function expand(item: any, reverseMap: MiniMap) {
  if (item.startsWith('_')) {
    return item.slice(1);
  }
  return reverseMap[item] || item;
}
