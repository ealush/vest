import createCache from '../../lib/cache';
import isFunction from '../../lib/isFunction';
import context from '../context';
import useTestCallbacks from '../state/useTestCallbacks';
import useTestObjects from '../state/useTestObjects';
import hasRemainingTests from '../suite/hasRemainingTests';
import {
  SEVERITY_GROUP_ERROR,
  SEVERITY_GROUP_WARN,
} from '../test/lib/VestTest/constants';
import genTestsSummary from './genTestsSummary';
import get from './get';
import getByGroup from './getByGroup';
import has from './has';
import hasByGroup from './hasByGroup';

const cache = createCache(20);

/**
 * Registers done callbacks.
 * @param {string} [fieldName]
 * @param {Function} doneCallback
 * @register {Object} Vest output object.
 */
const done = (...args) => {
  const [callback, fieldName] = args.reverse();
  const { stateRef } = context.use();

  const output = produce();

  // If we do not have any tests for current field
  const shouldSkipRegistration = fieldName && !output.tests[fieldName];

  if (!isFunction(callback) || shouldSkipRegistration) {
    return output;
  }

  const cb = context.bind({ stateRef }, () =>
    callback(produce(/*isDraft:*/ true))
  );

  // is suite finished || field name exists, and test is finished
  const shouldRunCallback =
    !hasRemainingTests() || (fieldName && !hasRemainingTests(fieldName));

  if (shouldRunCallback) {
    cb();
    return output;
  }

  useTestCallbacks(current => {
    if (fieldName) {
      current.fieldCallbacks[fieldName] = (
        current.fieldCallbacks[fieldName] || []
      ).concat(cb);
    } else {
      current.doneCallbacks.push(cb);
    }
    return current;
  });

  return output;
};

/**
 * @param {boolean} [isDraft]
 * @returns Vest output object.
 */

const produce = isDraft => {
  const { stateRef } = context.use();
  const [testObjects] = useTestObjects();
  return cache(
    [testObjects, isDraft],
    context.bind({ stateRef }, () =>
      Object.defineProperties(
        genTestsSummary(),
        [
          ['hasErrors', context.bind({ stateRef }, has, SEVERITY_GROUP_ERROR)],
          ['hasWarnings', context.bind({ stateRef }, has, SEVERITY_GROUP_WARN)],
          ['getErrors', context.bind({ stateRef }, get, SEVERITY_GROUP_ERROR)],
          ['getWarnings', context.bind({ stateRef }, get, SEVERITY_GROUP_WARN)],
          [
            'hasErrorsByGroup',
            context.bind({ stateRef }, hasByGroup, SEVERITY_GROUP_ERROR),
          ],
          [
            'hasWarningsByGroup',
            context.bind({ stateRef }, hasByGroup, SEVERITY_GROUP_WARN),
          ],
          [
            'getErrorsByGroup',
            context.bind({ stateRef }, getByGroup, SEVERITY_GROUP_ERROR),
          ],
          [
            'getWarningsByGroup',
            context.bind({ stateRef }, getByGroup, SEVERITY_GROUP_WARN),
          ],
        ]
          .concat(isDraft ? [] : [['done', context.bind({ stateRef }, done)]])
          .reduce(
            (properties, [name, value]) => (
              (properties[name] = {
                configurable: true,
                enumerable: true,
                value,
                writeable: true,
              }),
              properties
            ),
            {}
          )
      )
    )
  );
};

export default produce;
