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
    if (Object.prototype.hasOwnProperty.call(testedStorage, key)) {
      return testedStorage[key];
    }

    testedStorage[key] = Object.prototype.hasOwnProperty.call(res.tests, key);

    return selectors.tested(key);
  };

  selectors.untested = key => !selectors.tested(key);
  selectors.invalid = key => selectors.tested(key) && res.hasErrors(key);
  selectors.warning = key => selectors.tested(key) && res.hasWarnings(key);

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
