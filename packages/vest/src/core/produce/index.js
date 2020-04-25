import copy from '../../lib/copy';
import hasRemainingTests from '../state/hasRemainingTests';
import patch from '../state/patch';

/**
 * @param {string} suiteId
 * @param {'warn'|'error'} group
 * @returns all messages for given criteria.
 */
const collectFailureMessages = (state, group) => {
  const collector = {};

  for (const fieldName in state.tests) {
    if (state.tests?.[fieldName] && state.tests?.[fieldName][group]) {
      collector[fieldName] = state.tests[fieldName][group];
    }
  }

  return collector;
};

/**
 * @param {string} suiteId
 * @param {'errorCount'|'warnCount'} key lookup key
 * @param {string} [fieldName]
 * @returns {Boolean} whether a suite or field have errors or warnings.
 */
const has = (state, key, fieldName) => {
  if (!fieldName) {
    return Boolean(state?.[key]);
  }
  return Boolean(state?.tests?.[fieldName]?.[key]);
};

/**
 * @param {string} suiteId
 * @param {'errors'|'warnings'} key lookup key
 * @param {string} [fieldName]
 * @returns suite or field's errors or warnings.
 */
const get = (state, key, fieldName) => {
  if (!fieldName) {
    return collectFailureMessages(state, key);
  }

  return state.tests?.[fieldName]?.[key] ?? [];
};

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
const extract = ({ errorCount, warnCount, tests, name }) => ({
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
        ['hasErrors', has.bind(null, state, 'errorCount')],
        ['hasWarnings', has.bind(null, state, 'warnCount')],
        ['getErrors', get.bind(null, state, 'errors')],
        ['getWarnings', get.bind(null, state, 'warnings')],
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
