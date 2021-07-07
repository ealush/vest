import context from 'ctx';
import isFunction from 'isFunction';

import runCreateRef from '../../../packages/vest/testUtils/runCreateRef';

import './globals.d';

// TODO: Move it to the Vest area. make more usable
it.withContext = (str, cb, getCTX) => {
  return it(str, () =>
    context.run(
      isFunction(getCTX) ? getCTX() : getCTX ?? { stateRef: runCreateRef() },
      cb
    )
  );
};

// const toPass = (res: InstanceType<typeof RuleResult>) => ({
//   pass: res.pass,
//   message: () => 'enforceResult.pass failed validation',
// });

// const toPassWith = (enforcement: TRunnableRule, value?: any) => {
//   return {
//     pass:
//       enforcement.run(value).pass === true && enforcement.test(value) === true,
//     message: () => 'enforceResult.pass failed validation',
//   };
// };

const isDeepCopyOf = (
  source: any,
  clone: any
): { pass: boolean; message: () => string } => {
  const queue = [[source, clone]];

  outer: while (queue.length) {
    // @ts-ignore
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
  // toPass,
  // toPassWith,
  isDeepCopyOf,
});
