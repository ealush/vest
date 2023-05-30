const DIRECTIVE_PREFIX = '@vx';
const DIRECTIVE_ALLOW = 'allow';
const DIRECTIVE_NAME_DELIMITER = '-';

const DIRECTIVES = new Set([DIRECTIVE_ALLOW]);

module.exports = {
  isAllowed,
};

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

function isDirective(name, target) {
  const [prefix, directiveName] = name.split(DIRECTIVE_NAME_DELIMITER);

  const isValidDirective =
    prefix === DIRECTIVE_PREFIX && DIRECTIVES.has(directiveName);

  if (target) {
    return isValidDirective && directiveName === target;
  }

  return isValidDirective;
}
