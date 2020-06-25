/**
 * Simple copy Objects, array and primitives.
 */
const copy = <T>(node?: T): T => {
  if (!node) {
    return node;
  }

  if (Array.isArray(node)) {
    // @ts-ignore
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
