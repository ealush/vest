const path = require('path');

const RULE_NAME = path.basename(__filename, path.extname(__filename));

module.exports = {
  meta: {
    docs: {
      description:
        'Make sure that functions that use context hooks start with "use"',
      category: 'Possible Errors',
      recommended: true,
    },
    fixable: 'code',
    hasSuggestions: true,
    type: 'problem',
  },
  create(context) {
    return {
      [matcher(FUNC_DEC)](node) {
        const parentFunction = findAncestor(context, FUNC_DEC);

        if (parentFunction && !parentFunction.id.name.match(USE_MATCHER)) {
          report(context, parentFunction, parentFunction.id);
        }
      },
      [matcher(VAR_DEC)](node) {
        const parentFunction = findAncestor(context, 'ArrowFunctionExpression');

        if (parentFunction) {
          const variableDeclarator = findAncestor(context, VAR_DEC);

          report(context, parentFunction, variableDeclarator.id);
        }
      },
    };
  },
};

function isSilenced(context, node) {
  const nodeToCheckForComments =
    node.loc.start.column === 0 ? node : node.parent;

  return context.getCommentsBefore(nodeToCheckForComments).some(comment => {
    if (!comment.value) {
      return false;
    }

    const [directive, rules] = comment.value.trim().split(' ');

    if (directive !== ALLOW_DIRECTIVE) {
      return false;
    }

    const rulesArray = rules.split(',');

    return rulesArray.includes(RULE_NAME);
  });
}

function findAncestor(context, type) {
  return context.getAncestors().find(isType(type));
}

function matcher(type) {
  return `${type}${ID_NAME_MATCHER} ${CALL_EXPRESSION_MATCHER}`;
}

function report(context, node, id) {
  if (isSilenced(context, node)) {
    return;
  }
  return context.report({
    node,
    ...getLoc(id),
    data: {
      identifier: id.name,
    },
    message,
    suggest: [
      {
        desc: suggest,
        fix(fixer) {
          return fixer.replaceText(id, addUseToName(id.name));
        },
      },
    ],
  });
}

function addUseToName(name) {
  return `use${name[0].toUpperCase()}${name.slice(1)}`;
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

const suggest = "Rename function to start with 'use'";

const message =
  "Function {{ identifier }} does not start with 'use' but contains a call to function that starts with 'use'";

const USE_MATCHER = /use.*/;
const CALL_EXPRESSION_MATCHER = `CallExpression:matches([callee.name=${USE_MATCHER}])`;
const ID_NAME_MATCHER = `:not([id.name=${USE_MATCHER}])`;

const FUNC_DEC = 'FunctionDeclaration';
const VAR_DEC = 'VariableDeclarator';
const ALLOW_DIRECTIVE = '@vx-allow';
