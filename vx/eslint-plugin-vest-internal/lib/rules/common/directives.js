const DIRECTIVE_PREFIX = '@vx';
const DIRECTIVE_ALLOW = 'allow';
const DIRECTIVE_NAME_DELIMITER = '-';

const DIRECTIVES = new Set([DIRECTIVE_ALLOW]);

// eslint-disable-next-line complexity, max-params
export function isAllowed(context, sourceCode, node, id, ruleName) {
  if (id?.type === 'Identifier' && id?.parent?.type === 'VariableDeclarator') {
    return isAllowed(context, sourceCode, id.parent, id.parent, ruleName);
  }

  const nodeToCheckForComments =
    node?.loc?.start?.column === 0 ? node : node?.parent;

  if (!nodeToCheckForComments) {
    return false;
  }

  let comments = [];

  if (sourceCode) {
    let token = sourceCode.getTokenBefore(nodeToCheckForComments, {
      includeComments: true,
    });
    while (token && (token.type === 'Block' || token.type === 'Line')) {
      comments.push(token);
      token = sourceCode.getTokenBefore(token, { includeComments: true });
    }
  } else if (context.getCommentsBefore) {
    comments = context.getCommentsBefore(nodeToCheckForComments);
  }

  return (comments ?? []).some(comment => {
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
