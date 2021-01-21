import createContext from 'context';

import isFunction from 'isFunction';
import throwError from 'throwError';

// Matches either a dot (.) inside a string
// Or a number wrapped in brackets for simple
// path lookup
const toPathRegexp = /\.|\[([\d)]*)\]/g;

const context = createContext(() => ({
  include: [],
  exclude: [],
}));

/**
 * A wrapper function for an enforce schema. It gives
 * back an interface that's similar to Vest's result object
 * that will make it easier to query the validation results
 *
 * @param {Object} enforceSchema
 * @param {Function} [body]
 */
function schema(enforceSchema, body) {
  return context.bind({}, function (...args) {
    if (isFunction(body)) {
      body(...args);
    }

    if (!isFunction(enforceSchema.run)) {
      throwError('Not a valid enforce schema.');
    }
    const result = enforceSchema.run(...args);

    const parsedResult = transformResultObject(result);

    let _hasErrors, _hasWarnings;

    const errorMessages = {};
    const warningMessages = {};
    const tests = {};

    const { include, exclude } = context.use();

    for (const test in parsedResult) {
      const isExcluded = exclude.some(name => test.startsWith(name));

      const isIncluded = include.some(name => test.startsWith(name));

      if (isExcluded || (include.length && !isIncluded)) {
        continue;
      }

      tests[test] = parsedResult[test];

      errorMessages[test] = parsedResult[test].errors = Object.keys(
        parsedResult[test].errors
      );
      warningMessages[test] = parsedResult[test].warnings = Object.keys(
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
      return key ? !!errorMessages[key]?.length : _hasErrors;
    }

    function hasWarnings(key) {
      return key ? !!warningMessages[key]?.length : _hasWarnings;
    }

    return {
      getErrors,
      getWarnings,
      hasErrors,
      hasWarnings,
      tests,
    };
  });
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

export default Object.defineProperties(schema, {
  skip: {
    value: function skip(namespace) {
      const { exclude } = context.use();
      exclude.push(namespace);
    },
  },
  only: {
    value: function only(namespace) {
      const { include } = context.use();
      include.push(namespace);
    },
  },
});
