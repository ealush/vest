export function findAncestor(context, type) {
  return context.getAncestors().find(isType(type));
}

export function isType(type) {
  return node => node.type === type;
}

export function getLoc(node) {
  const start = node?.loc?.start ?? { line: 0, column: 0 };
  const end = node?.loc?.end ?? { line: 0, column: 0 };

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
