module.exports = {
  findAncestor,
  isType,
  getLoc,
};

function findAncestor(context, type) {
  return context.getAncestors().find(isType(type));
}

function isType(type) {
  return node => node.type === type;
}

function getLoc(node) {
  const { start, end } = node.loc;

  return {
    loc: {
      start: {
        line: start.line,
        column: start.column,
      },
      end: {
        line: end.line,
        column: end.column,
      },
    },
  };
}
