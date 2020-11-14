import optional from 'optional';
import runLazyRules from 'runLazyRules';
/**
 * @param {Object} obj  Data object that gets validated
 * @param {Object} shapeObj  Shape definition
 */
export default function shape(obj, shapeObj) {
  for (const key in shapeObj) {
    const current = shapeObj[key];
    const value = obj[key];

    if (
      !runLazyRules(current, ruleName => {
        // Optional is a unique rule - it needs to know whether the
        // value is an actual property of the provided object, so
        // instead of passing just the value as we do in all other cases
        // in the case of `optional` we pass the object and the key
        // so it can check it.
        return ruleName === optional.name ? [obj, key] : value;
      })
    ) {
      return false;
    }
  }

  for (const key in obj) {
    if (!shapeObj[key]) {
      return false;
    }
  }

  return true;
}
