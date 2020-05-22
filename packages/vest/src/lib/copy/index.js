/**
 * Simple copy Objects, array and primitives.
 * @param {*} source
 * @returns {*} Deep copy of source.
 */
const copy = node => {
  if (!node) {
    return node;
  }

  if (Array.isArray(node)) {
    return node.map(copy);
  }

  if (typeof node === 'object') {
    const j = { ...node };
    for (const key in j) {
      j[key] = copy(j[key]);
    }
    return j;
  }

  return node;
};

export default copy;
