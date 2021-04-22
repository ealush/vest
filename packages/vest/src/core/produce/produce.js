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
import { HAS_WARNINGS, HAS_ERRORS } from 'sharedKeys';
import { useTestCallbacks, useTestObjects } from 'stateHooks';
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

  // If we do not have any test runs for the current field
  const shouldSkipRegistration =
    fieldName &&
    (!output.tests[fieldName] || output.tests[fieldName].testCount === 0);

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

  const [, setTestCallbacks] = useTestCallbacks();
  setTestCallbacks(current => {
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
      [
        [HAS_ERRORS, hasFaillures, SEVERITY_GROUP_ERROR],
        [HAS_WARNINGS, hasFaillures, SEVERITY_GROUP_WARN],
        ['getErrors', getFailures, SEVERITY_GROUP_ERROR],
        ['getWarnings', getFailures, SEVERITY_GROUP_WARN],
        ['hasErrorsByGroup', hasFailuresByGroup, SEVERITY_GROUP_ERROR],
        ['hasWarningsByGroup', hasFailuresByGroup, SEVERITY_GROUP_WARN],
        ['getErrorsByGroup', getFailuresByGroup, SEVERITY_GROUP_ERROR],
        ['getWarningsByGroup', getFailuresByGroup, SEVERITY_GROUP_WARN],
      ]
        .concat(isDraft ? [] : [['done', done]])
        .reduce((properties, [name, fn, severityKey]) => {
          properties[name] = context.bind(ctxRef, fn, severityKey);
          return properties;
        }, genTestsSummary())
    )
  );
};

export default produce;
