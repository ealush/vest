import createCache from '../../lib/cache';
import context, { bindContext } from '../context';
import hasRemainingTests from '../suite/hasRemainingTests';
import {
  SEVERITY_GROUP_ERROR,
  SEVERITY_GROUP_WARN,
} from '../test/lib/VestTest/constants';
import useTestObjects from '../test/useTestObjects';
import genTestsSummary, { countFailures } from './genTestsSummary';
import get from './get';
import getByGroup from './getByGroup';
import has from './has';
import hasByGroup from './hasByGroup';
import useTestCallbacks from './useTestCallbacks';

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

  if (typeof callback !== 'function' || shouldSkipRegistration) {
    return output;
  }

  const cb = bindContext({ stateRef }, () =>
    callback(produce({ draft: true }))
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
      current.fieldCallbacks[fieldName] = [].concat(
        ...(current.fieldCallbacks[fieldName] || []),
        cb
      );
    } else {
      current.doneCallbacks.push(cb);
    }
    return current;
  });

  return output;
};

/**
 * @param {Object} Options
 * @param {boolean} [Options.draft]
 * @returns Vest output object.
 */

const produce = ({ draft } = {}) => {
  const { stateRef } = context.use();
  const [testObjects] = useTestObjects();
  return cache(
    [testObjects, draft],
    bindContext({ stateRef }, () =>
      Object.defineProperties(
        countFailures(genTestsSummary()),
        [
          ['hasErrors', bindContext({ stateRef }, has, SEVERITY_GROUP_ERROR)],
          ['hasWarnings', bindContext({ stateRef }, has, SEVERITY_GROUP_WARN)],
          ['getErrors', bindContext({ stateRef }, get, SEVERITY_GROUP_ERROR)],
          ['getWarnings', bindContext({ stateRef }, get, SEVERITY_GROUP_WARN)],
          [
            'hasErrorsByGroup',
            bindContext({ stateRef }, hasByGroup, SEVERITY_GROUP_ERROR),
          ],
          [
            'hasWarningsByGroup',
            bindContext({ stateRef }, hasByGroup, SEVERITY_GROUP_WARN),
          ],
          [
            'getErrorsByGroup',
            bindContext({ stateRef }, getByGroup, SEVERITY_GROUP_ERROR),
          ],
          [
            'getWarningsByGroup',
            bindContext({ stateRef }, getByGroup, SEVERITY_GROUP_WARN),
          ],
        ]
          .concat(draft ? [] : [['done', bindContext({ stateRef }, done)]])
          .reduce((properties, [name, value]) => {
            properties[name] = {
              configurable: true,
              enumerable: true,
              value,
              writeable: true,
            };
            return properties;
          }, {})
      )
    )
  );
};

export default produce;
