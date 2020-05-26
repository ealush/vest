import copy from '../../lib/copy';
import hasRemainingTests from '../state/hasRemainingTests';
import patch from '../state/patch';
import {
  SEVERITY_COUNT_ERROR,
  SEVERITY_COUNT_WARN,
  SEVERITY_GROUP_ERROR,
  SEVERITY_GROUP_WARN,
} from '../test/lib/VestTest/constants';
import get from './get';
import getByGroup from './getByGroup';
import has from './has';
import hasByGroup from './hasByGroup';

/**
 * Registers done callbacks.
 * @param {string} suiteId
 * @param {string} [fieldName]
 * @param {Function} doneCallback
 * @register {Object} Vest output object.
 */
const done = (state, ...args) => {
  const { length, [length - 1]: callback, [length - 2]: fieldName } = args;

  const output = produce(state);

  // ❗️The reason we use `tests` instead of skipped
  // is that we later on might merge the skipped tests into
  // our current state, and we still want to run their callbacks
  const shouldSkipRegistration = fieldName && !state.tests[fieldName];

  if (typeof callback !== 'function' || shouldSkipRegistration) {
    return output;
  }

  const cb = () => callback(produce(state, { draft: true }));
  const isFinishedTest = fieldName && !hasRemainingTests(state, fieldName);
  const isSuiteFinished = !hasRemainingTests(state);
  const shouldRunCallback = isFinishedTest || isSuiteFinished;
  if (shouldRunCallback) {
    cb();
    return output;
  }

  patch(state.suiteId, state => {
    if (fieldName) {
      state.fieldCallbacks[fieldName] = [].concat(
        ...(state.fieldCallbacks[fieldName] || []),
        cb
      );
    } else {
      state.doneCallbacks.push(cb);
    }
    return state;
  });

  return output;
};

/**
 * @returns {Object} with only public properties.
 */
const extract = ({ groups, errorCount, warnCount, tests, name }) => ({
  groups,
  errorCount,
  warnCount,
  tests,
  name,
});

/**
 * @param {string} suiteId
 * @param {Object} Options
 * @returns Vest output object.
 */
const produce = (state, { draft } = {}) =>
  state
  |> extract
  |> copy
  |> (transformedState =>
    Object.defineProperties(
      transformedState,
      [
        ['hasErrors', has.bind(null, state, SEVERITY_COUNT_ERROR)],
        ['hasWarnings', has.bind(null, state, SEVERITY_COUNT_WARN)],
        ['getErrors', get.bind(null, state, SEVERITY_GROUP_ERROR)],
        ['getWarnings', get.bind(null, state, SEVERITY_GROUP_WARN)],
        [
          'hasErrorsByGroup',
          hasByGroup.bind(null, state, SEVERITY_COUNT_ERROR),
        ],
        [
          'hasWarningsByGroup',
          hasByGroup.bind(null, state, SEVERITY_COUNT_WARN),
        ],
        [
          'getErrorsByGroup',
          getByGroup.bind(null, state, SEVERITY_GROUP_ERROR),
        ],
        [
          'getWarningsByGroup',
          getByGroup.bind(null, state, SEVERITY_GROUP_WARN),
        ],
      ]
        .concat(draft ? [] : [['done', done.bind(null, state)]])
        .reduce(
          (properties, [name, value]) =>
            Object.assign(properties, {
              [name]: {
                value,
                writeable: true,
                configurable: true,
                enumerable: true,
              },
            }),
          {}
        )
    ));

export default produce;
