export function findAncestor(node, sourceCode, type) {
  return sourceCode.getAncestors(node).find(isType(type));
}

export function isType(type) {
  return node => node.type === type;
}

// eslint-disable-next-line complexity
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
