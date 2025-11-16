const DIRECTIVE_PREFIX = '@vx';
const DIRECTIVE_ALLOW = 'allow';
const DIRECTIVE_NAME_DELIMITER = '-';

const DIRECTIVES = new Set([DIRECTIVE_ALLOW]);

module.exports = {
  isAllowed,
};

/**
 * Checks whether an identifier is allowed by vx directive comments.
 * @param {import('eslint').Rule.RuleContext} context ESLint rule context.
 * @param {any} node AST node associated with the call.
 * @param {any} id Identifier node to check.
 * @param {string} ruleName Rule identifier to whitelist.
 * @returns {boolean}
 */
function isAllowed(context, node, id, ruleName) {
  // This hnadles cases like: `const emit = useEmit();`
  if (id.type === 'Identifier' && id.parent.type === 'VariableDeclarator') {
    return isAllowed(context, id.parent, id.parent, ruleName);
  }

  const nodeToCheckForComments =
    node.loc.start.column === 0 ? node : node.parent;

  return context.getCommentsBefore(nodeToCheckForComments).some(comment => {
    if (!comment.value) {
      return false;
    }

    const [directive, ...rules] = comment.value
      .trim()
      .split(/ |,/)
      .filter(Boolean);

    if (rules.length === 0) {
      return true;
    }

    if (!isDirective(directive, DIRECTIVE_ALLOW)) {
      return false;
    }

    return rules.includes(ruleName);
  });
}

/**
 * Validates a directive name and optional target.
 * @param {string} name Directive name (e.g. "@vx-allow").
 * @param {string} [target] Directive type to enforce.
 * @returns {boolean}
 */
function isDirective(name, target) {
  const [prefix, directiveName] = name.split(DIRECTIVE_NAME_DELIMITER);

  const isValidDirective =
    prefix === DIRECTIVE_PREFIX && DIRECTIVES.has(directiveName);

  if (target) {
    return isValidDirective && directiveName === target;
  }

  return isValidDirective;
}
