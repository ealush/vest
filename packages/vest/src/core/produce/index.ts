import copy from '../../lib/copy';
import hasRemainingTests from '../state/hasRemainingTests';
import patch from '../state/patch';
import { SEVERITY_GROUP_ERROR, SEVERITY_GROUP_WARN } from './constants';
import genTestsSummary, { countFailures } from './genTestsSummary';
import get from './get';
import getByGroup from './getByGroup';
import has from './has';
import hasByGroup from './hasByGroup';

/**
 * Registers done callbacks.
 * @param {string} [fieldName]
 * @param {Function} doneCallback
 */
// @ts-ignore
const done = (state: ISuiteState, ...args): IResult => {
  const { length, [length - 1]: callback, [length - 2]: fieldName } = args;

  const output = produce(state);

  // If we do not have any tests for current field
  const shouldSkipRegistration = fieldName && !output.tests[fieldName];

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

const extract = ({
  groups,
  tests,
  name,
  testCount,
  warnCount,
  errorCount,
}) => ({
  groups,
  tests,
  name,
  testCount,
  warnCount,
  errorCount,
});

type DefineProperties = {
  [property: string]: {
    configurable: true;
    enumerable: true;
    value: any;
    writeable: true;
  };
};

const produce = (
  state: ISuiteState,
  { draft }: { draft?: boolean } = {}
): IResult =>
  [
    copy,
    genTestsSummary,
    countFailures,
    extract,
    transformedState =>
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
          .concat(draft ? [] : [['done', done.bind(null, state)]])
          .reduce(
            (
              properties: DefineProperties,
              [name, value]: [string, Function]
            ): DefineProperties => {
              properties[name] = {
                configurable: true,
                enumerable: true,
                value,
                writeable: true,
              };
              return properties;
            },
            {}
          )
      ),
  ].reduce((state, fn) => fn(state), state);

export default produce;
