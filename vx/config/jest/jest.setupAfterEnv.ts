import { isFunction } from 'vest-utils';

import './globals.d';

// eslint-disable-next-line complexity
const isDeepCopyOf = (
  source: any,
  clone: any
): { pass: boolean; message: () => string } => {
  const queue = [[source, clone]];

  outer: while (queue.length) {
    // @ts-expect-error - ts thinks it may be undefined, but it's unlikely, and will fail the tests anyway if it fails.
    const [source, clone] = queue.shift();

    if (!source || typeof source !== 'object') {
      if (!isFunction(clone)) {
        if (clone !== source) {
          return {
            pass: false,
            message: () => 'Source and clone are not identical',
          };
        }
      }
      continue;
    }

    if (clone === source) {
      return {
        pass: false,
        message: () =>
          `Source and clone are the same object. Expected a deep copy. ${JSON.stringify(
            source
          )}===${JSON.stringify(clone)}`,
      };
    }

    // Short circuit
    if (
      (clone && !source) ||
      (source && !clone) ||
      typeof source !== typeof clone
    ) {
      return {
        pass: false,
        message: () =>
          `Source and clone are not of the same type: ${JSON.stringify(
            source
          )} does not equal ${JSON.stringify(clone)}`,
      };
    }

    if (Array.isArray(source)) {
      // Short circuit
      if (!Array.isArray(clone) || source.length !== clone.length) {
        return {
          pass: false,
          message: () =>
            `source and clone arrays are not identical. ${JSON.stringify(
              source
            )} does not equal ${JSON.stringify(clone)}`,
        };
      }
      source.forEach((_, i) => {
        queue.push([source[i], clone[i]]);
      });
    } else if (typeof source === 'object') {
      Object.keys(source).forEach(key => queue.push([source[key], clone[key]]));
    }

    continue outer;
  }

  return { pass: true, message: () => 'success' };
};

expect.extend({
  isDeepCopyOf,
});
