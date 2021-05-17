/**
 *
 * @param {any[]} array
 * @param {() => boolean} predicate
 * @returns {[any[], any[]]}
 */
export default function partition(array, predicate) {
  return array.reduce(
    (partitions, value, index) => {
      partitions[predicate(value, index, array) ? 0 : 1].push(value);
      return partitions;
    },
    [[], []]
  );
}
