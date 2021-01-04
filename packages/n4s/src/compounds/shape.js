import hasOwnProperty from 'hasOwnProperty';

import EnforceContext from 'EnforceContext';
import RuleResult from 'RuleResult';
import { runLazyRule } from 'runLazyRules';
import shouldFailFast from 'shouldFailFast';
/**
 * @param {EnforceContext} inputObject  Data object that gets validated
 * @param {Object} shapeObj  Shape definition
 * @param {Object} options
 * @param {boolean} options.loose Ignore extra keys not defined in shapeObj
 */
export function shape(inputObject, shapeObj, options) {
  // Extract the object from context
  const obj = EnforceContext.unwrap(inputObject);

  // Create a new result object
  const result = new RuleResult(true);

  // Iterate over the shape keys
  for (const key in shapeObj) {
    const current = shapeObj[key];
    const value = obj[key];

    if (shouldFailFast(value, result)) {
      break;
    }

    // Set each key in the result object
    result.setChild(
      key,
      runLazyRule(
        current,
        new EnforceContext({ value, obj, key }).setFailFast(
          inputObject.failFast
        )
      )
    );
  }

  // If mode is not loose
  if (!(options || {}).loose) {
    // Check that each key in the input object exists in the shape
    for (const key in obj) {
      if (!hasOwnProperty(shapeObj, key)) {
        return result.setFailed(true);
      }
    }
  }

  return result;
}

export const loose = (obj, shapeObj) => shape(obj, shapeObj, { loose: true });
