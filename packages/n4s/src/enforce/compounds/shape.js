import asArray from 'asArray';
import optional from 'optional';

/**
 * @param {Object} obj  Data object that gets validated
 * @param {*} shapeObj  Shape definition
 */
export default function shape(obj, shapeObj) {
  for (const key in shapeObj) {
    const current = shapeObj[key];
    const value = obj[key];

    if (
      !asArray(current).every(fn =>
        fn(fn.name === optional.name ? [obj, key] : value)
      )
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
