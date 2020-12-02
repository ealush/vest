/**
 * A safe hasOwnProperty access
 */
export default function hasOwnProperty(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}
