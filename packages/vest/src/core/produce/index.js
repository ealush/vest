import createCache from '../../lib/cache';
import copy from '../../lib/copy';
import hasRemainingTests from '../suite/hasRemainingTests';
import {
  SEVERITY_GROUP_ERROR,
  SEVERITY_GROUP_WARN,
} from '../test/lib/VestTest/constants';
import genTestsSummary, { countFailures } from './genTestsSummary';
import get from './get';
import getByGroup from './getByGroup';
import has from './has';
import hasByGroup from './hasByGroup';

const cache = createCache(20);

/**
 * Registers done callbacks.
 * @param {Object} state
 * @param {string} [fieldName]
 * @param {Function} doneCallback
 * @register {Object} Vest output object.
 */
const done = (stateRef, ...args) => {
  const { length, [length - 1]: callback, [length - 2]: fieldName } = args;

  const output = produce(stateRef);

  // If we do not have any tests for current field
  const shouldSkipRegistration = fieldName && !output.tests[fieldName];

  if (typeof callback !== 'function' || shouldSkipRegistration) {
    return output;
  }

  const state = stateRef.current();

  const cb = () => callback(produce(stateRef, { draft: true }));
  const isFinishedTest = fieldName && !hasRemainingTests(state, fieldName);
  const isSuiteFinished = !hasRemainingTests(state);
  const shouldRunCallback = isFinishedTest || isSuiteFinished;
  if (shouldRunCallback) {
    cb();
    return output;
  }

  stateRef.patch(state => {
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
const extract = ({ groups, tests, name }) => ({
  groups,
  tests,
  name,
});

/**
 * @param {Object} state
 * @param {Object} Options
 * @param {boolean} [Options.draft]
 * @returns Vest output object.
 */

const produce = (stateRef, { draft } = {}) => {
  const state = stateRef.current();
  return cache(
    [state, draft],
    () =>
      state
      |> copy
      |> genTestsSummary
      |> extract
      |> countFailures
      |> (transformedState =>
        Object.defineProperties(
          transformedState,
          [
            ['hasErrors', has.bind(null, state, SEVERITY_GROUP_ERROR)],
            ['hasWarnings', has.bind(null, state, SEVERITY_GROUP_WARN)],
            ['getErrors', get.bind(null, state, SEVERITY_GROUP_ERROR)],
            ['getWarnings', get.bind(null, state, SEVERITY_GROUP_WARN)],
            [
              'hasErrorsByGroup',
              hasByGroup.bind(null, state, SEVERITY_GROUP_ERROR),
            ],
            [
              'hasWarningsByGroup',
              hasByGroup.bind(null, state, SEVERITY_GROUP_WARN),
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
            .concat(draft ? [] : [['done', done.bind(null, stateRef)]])
            .reduce((properties, [name, value]) => {
              properties[name] = {
                configurable: true,
                enumerable: true,
                value,
                writeable: true,
              };
              return properties;
            }, {})
        ))
  );
};

export default produce;
