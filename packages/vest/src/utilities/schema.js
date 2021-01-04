import isFunction from 'isFunction';
import throwError from 'throwError';

// Matches either a dot (.) inside a string
// Or a number wrapped in brackets for simple
// path lookup
const toPathRegexp = /\.|\[([\d)]*)\]/g;

/**
 * A wrapper function for an enforce schema. It gives
 * back an interface that's similar to Vest's result object
 * that will make it easier to query the validation results
 *
 * @param {Object} enforceSchema
 */
export default function schema(enforceSchema) {
  return function (data) {
    if (!isFunction(enforceSchema.run)) {
      throwError('Not a valid enforce schema.');
    }
    const result = enforceSchema.run(data);

    const parsedResult = transformResultObject(result);

    let _hasErrors, _hasWarnings;

    const errorMessages = {};
    const warningMessages = {};

    for (const test in parsedResult) {
      errorMessages[test] = parsedResult[test].errors = Object.keys(
        parsedResult[test].errors
      );
      errorMessages[test] = parsedResult[test].warnings = Object.keys(
        parsedResult[test].warnings
      );
      _hasErrors = _hasErrors || parsedResult[test].hasErrors;
      _hasWarnings = _hasWarnings || parsedResult[test].hasWarnings;
    }

    const getFn = (key, storage) =>
      !key ? storage : getKeyFromResults(key, storage) || [];

    function getErrors(key) {
      return getFn(key, errorMessages);
    }

    function getWarnings(key) {
      return getFn(key, warningMessages);
    }

    function hasErrors(key) {
      return key ? parsedResult[key].hasErrors : _hasErrors;
    }

    function hasWarnings(key) {
      return key ? parsedResult[key].hasWarnings : _hasWarnings;
    }

    return {
      getErrors,
      getWarnings,
      hasErrors,
      hasWarnings,
      tests: parsedResult,
    };
  };
}

function getKeyFromResults(key, storage) {
  // If the provided key exists in the object, return as is.
  if (storage[key]) {
    return storage[key];
  }

  const parsed = key.split(toPathRegexp).reduce((path, current) => {
    // If current path segment is falsy, continue
    if (!current) {
      return path;
    }

    const parsedInt = parseInt(current);

    // If the path segment equals (==) its parseInt result, it is a number
    const isNumber = parsedInt == current;

    // If the path is still empty
    if (!path) {
      // return the current segment
      return path + (isNumber ? parsedInt : current);
    }

    // if number, wrap with a brackets, else, concatenate with a period
    return path + (isNumber ? `[${parsedInt}]` : '.' + current);
  }, '');

  // return parsed path
  return storage[parsed];
}

// Parses the result object
function transformResultObject(root) {
  const tests = {};
  function traverse(node, key = '') {
    if (key) {
      tests[key] = {
        errors: [],
        hasErrors: node.hasErrors,
        hasWarnings: node.hasWarnings,
        warnings: [],
      };
    }

    // Extract the error and warning messages from each node
    if (node.failed && node.message) {
      if (node.warn) {
        node.warnings = Object.assign({}, node.warnings, {
          [node.message]: node.message,
        });
      } else {
        node.errors = Object.assign({}, node.errors, {
          [node.message]: node.message,
        });
      }
    }

    // traverse each child
    for (const childKey in node.children) {
      const child = node.children[childKey];

      // Traverse each child node
      traverse(
        child,
        !key
          ? childKey
          : [
              key,
              node.isArray ? `[${childKey}]` : `${key ? '.' : ''}${childKey}`,
            ].join('')
      );

      // concatenate the node's messages with its childrens' messages
      node.warnings = Object.assign({}, node.warnings, child.warnings);
      node.errors = Object.assign({}, node.errors, child.errors);
    }

    // Update the shared tests object
    if (key) {
      tests[key].warnings = Object.assign(
        {},
        tests[key].warnings,
        node.warnings
      );
      tests[key].errors = Object.assign({}, tests[key].errors, node.errors);
    }
  }

  traverse(root);

  return tests;
}
