import createCache from 'cache';
import context from 'ctx';
import genTestsSummary from 'genTestsSummary';
import getFailures from 'getFailures';
import getFailuresByGroup from 'getFailuresByGroup';
import hasFaillures from 'hasFaillures';
import hasFailuresByGroup from 'hasFailuresByGroup';
import hasRemainingTests from 'hasRemainingTests';
import isFunction from 'isFunction';
import { SEVERITY_GROUP_ERROR, SEVERITY_GROUP_WARN } from 'resultKeys';
import useTestCallbacks from 'useTestCallbacks';
import useTestObjects from 'useTestObjects';
import withArgs from 'withArgs';

const cache = createCache(20);

/**
 * Registers done callbacks.
 * @param {string} [fieldName]
 * @param {Function} doneCallback
 * @register {Object} Vest output object.
 */
const done = withArgs(args => {
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
});

/**
 * @param {boolean} [isDraft]
 * @returns Vest output object.
 */
const produce = isDraft => {
  const { stateRef } = context.use();
  const [testObjects] = useTestObjects();

  const ctxRef = { stateRef };

  return cache(
    [testObjects, isDraft],
    context.bind(ctxRef, () =>
      Object.defineProperties(
        genTestsSummary(),
        [
          ['hasErrors', hasFaillures, SEVERITY_GROUP_ERROR],
          ['hasWarnings', hasFaillures, SEVERITY_GROUP_WARN],
          ['getErrors', getFailures, SEVERITY_GROUP_ERROR],
          ['getWarnings', getFailures, SEVERITY_GROUP_WARN],
          ['hasErrorsByGroup', hasFailuresByGroup, SEVERITY_GROUP_ERROR],
          ['hasWarningsByGroup', hasFailuresByGroup, SEVERITY_GROUP_WARN],
          ['getErrorsByGroup', getFailuresByGroup, SEVERITY_GROUP_ERROR],
          ['getWarningsByGroup', getFailuresByGroup, SEVERITY_GROUP_WARN],
        ]
          .concat(isDraft ? [] : [['done', done]])
          .reduce(
            (properties, [name, fn, severityKey]) => (
              (properties[name] = {
                configurable: true,
                enumerable: true,
                name,
                value: context.bind(ctxRef, fn, severityKey),
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
