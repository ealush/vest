import hasOwnProperty from 'hasOwnProperty';

import { HAS_WARNINGS, HAS_ERRORS } from 'sharedKeys';

/**
 * Creates a function that returns class names that match the validation result
 * @param {Object} res      Vest Result Object
 * @param {Object} classes  Object with key-value pairs of selectors and classes
 * @returns {Function}
 */
const classNames = (res, classes = {}) => {
  if (!res || typeof res.hasErrors !== 'function') {
    throw new Error(
      "[vest/classNames]: Expected first argument to be Vest's result object."
    );
  }

  const testedStorage = {};

  const selectors = {};

  selectors.tested = key => {
    if (hasOwnProperty(testedStorage, key)) {
      return testedStorage[key];
    }

    testedStorage[key] = hasOwnProperty(res.tests, key);

    return selectors.tested(key);
  };

  selectors.untested = key => !selectors.tested(key);
  selectors.invalid = key => selectors.tested(key) && res[HAS_ERRORS](key);
  selectors.warning = key => selectors.tested(key) && res[HAS_WARNINGS](key);
  selectors.valid = key =>
    selectors.tested(key) && !res[HAS_WARNINGS](key) && !res[HAS_ERRORS](key);

  return key => {
    const classesArray = [];

    for (const selector in classes) {
      if (selectors[selector] && selectors[selector](key)) {
        classesArray.push(classes[selector]);
      }
    }

    return classesArray.join(' ');
  };
};

export default classNames;
