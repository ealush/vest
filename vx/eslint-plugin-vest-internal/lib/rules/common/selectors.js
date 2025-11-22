export { findAncestor, isType, getLoc };

/**
 * Finds the first ancestor of a given AST node type.
 * @param {import('eslint').Rule.RuleContext} context ESLint rule context.
 * @param {string} type AST node type to match.
 * @returns {any | undefined} Matching ancestor node if found.
 */
function findAncestor(context, type) {
  return context.getAncestors().find(isType(type));
}

/**
 * Creates a predicate that matches an AST node type.
 * @param {string} type AST node type.
 * @returns {(node: any) => boolean}
 */
function isType(type) {
  return node => node.type === type;
}

/**
 * Returns a serializable location object for an AST node.
 * @param {import('estree').Node} node AST node with `loc`.
 * @returns {{ loc: { start: { line: number, column: number }, end: { line: number, column: number }}}}
 */
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
