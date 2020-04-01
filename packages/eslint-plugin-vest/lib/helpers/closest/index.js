module.exports = function closest(node, type) {
  if (!node) {
    return null;
  }

  if (node.type === type) {
    return node;
  }

  return node.parent ? closest(node.parent, type) : null;
};
