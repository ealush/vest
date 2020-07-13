/**
 * Removes first found element from array
 * WARNING: Mutates array
 *
 * @param {any[]} array
 * @param {any} element
 */
const removeElementFromArray = (array, element) => {
  const index = array.findIndex(item => item === element);
  if (index !== -1) {
    array.splice(index, 1);
  }

  return array;
};

export default removeElementFromArray;
