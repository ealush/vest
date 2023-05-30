const path = require('path');

const { isAllowed } = require('./common/directives');
const { USE_MATCHER, VAR_DEC, FUNC_DEC } = require('./common/matchers');
const { findAncestor, getLoc } = require('./common/selectors');

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

function matcher(type) {
  return `${type}${ID_NAME_MATCHER} ${CALL_EXPRESSION_MATCHER}`;
}

function report(context, node, id) {
  if (isAllowed(context, node, id, RULE_NAME)) {
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

const suggest = "Rename function to start with 'use'";

const message =
  "Function {{ identifier }} does not start with 'use' but contains a call to function that starts with 'use'";

const CALL_EXPRESSION_MATCHER = `CallExpression:matches([callee.name=${USE_MATCHER}])`;
const ID_NAME_MATCHER = `:not([id.name=${USE_MATCHER}])`;
