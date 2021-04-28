import createCache from 'cache';
import context from 'ctx';
import genTestsSummary from 'genTestsSummary';
import getFailures from 'getFailures';
import getFailuresByGroup from 'getFailuresByGroup';
import hasFailures from 'hasFailures';
import hasFailuresByGroup from 'hasFailuresByGroup';
import hasRemainingTests from 'hasRemainingTests';
import isFunction from 'isFunction';
import { SEVERITY_GROUP_ERROR, SEVERITY_GROUP_WARN } from 'resultKeys';
import { HAS_WARNINGS, HAS_ERRORS } from 'sharedKeys';
import {
  useTestCallbacks,
  useTestObjects,
  useOptionalFields,
} from 'stateHooks';
import withArgs from 'withArgs';

const cache = createCache(20);

/**
 * @param {boolean} [isDraft]
 * @returns Vest output object.
 */
const produce = isDraft => {
  const { stateRef, optional } = context.use();
  const [testObjects] = useTestObjects();

  const ctxRef = { stateRef, optional };

  return cache(
    [testObjects, isDraft],
    context.bind(ctxRef, () =>
      [
        [HAS_ERRORS, hasFailures, SEVERITY_GROUP_ERROR],
        [HAS_WARNINGS, hasFailures, SEVERITY_GROUP_WARN],
        ['getErrors', getFailures, SEVERITY_GROUP_ERROR],
        ['getWarnings', getFailures, SEVERITY_GROUP_WARN],
        ['hasErrorsByGroup', hasFailuresByGroup, SEVERITY_GROUP_ERROR],
        ['hasWarningsByGroup', hasFailuresByGroup, SEVERITY_GROUP_WARN],
        ['getErrorsByGroup', getFailuresByGroup, SEVERITY_GROUP_ERROR],
        ['getWarningsByGroup', getFailuresByGroup, SEVERITY_GROUP_WARN],
      ]
        .concat(
          [['isValid', isValid]],
          isDraft ? [] : [['done', withArgs(done)]]
        )
        .reduce((properties, [name, fn, severityKey]) => {
          properties[name] = context.bind(ctxRef, fn, severityKey);
          return properties;
        }, genTestsSummary())
    )
  );
};

export default produce;

/**
 * Registers done callbacks.
 * @param {string} [fieldName]
 * @param {Function} doneCallback
 * @register {Object} Vest output object.
 */
function done(args) {
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
}

function isValid() {
  const result = produce();

  if (result.hasErrors()) {
    return false;
  }

  const [testObjects] = useTestObjects();

  if (testObjects.length === 0) {
    return false;
  }

  const [optionalFields] = useOptionalFields();

  for (const test in result.tests) {
    if (!optionalFields[test] && result.tests[test].testCount === 0) {
      return false;
    }
  }

  return true;
}
