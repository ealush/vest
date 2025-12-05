import path from 'path';

import { isAllowed } from './common/directives.js';
import { USE_MATCHER, VAR_DEC, FUNC_DEC } from './common/matchers.js';
import { findAncestor, getLoc } from './common/selectors.js';

const RULE_NAME = path.basename(
  new URL('', import.meta.url).pathname,
  path.extname(new URL('', import.meta.url).pathname),
);

const hasIdWithName = node =>
  Boolean(node?.id && typeof node.id.name === 'string');

export default {
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
    const sourceCode = context.sourceCode || context.getSourceCode();
    return {
      [matcher(FUNC_DEC)](node) {
        const parentFunction = findAncestor(node, sourceCode, FUNC_DEC);

        if (
          hasIdWithName(parentFunction) &&
          !USE_MATCHER.test(parentFunction.id.name)
        ) {
          report(context, sourceCode, parentFunction, parentFunction.id);
        }
      },
      [matcher(VAR_DEC)](node) {
        const parentFunction = findAncestor(
          node,
          sourceCode,
          'ArrowFunctionExpression',
        );

        if (parentFunction) {
          const variableDeclarator = findAncestor(node, sourceCode, VAR_DEC);

          if (hasIdWithName(variableDeclarator)) {
            report(context, sourceCode, parentFunction, variableDeclarator.id);
          }
        }
      },
    };
  },
};

function matcher(type) {
  if (type === VAR_DEC) {
    return `${type}${ID_NAME_MATCHER} > ArrowFunctionExpression ${CALL_EXPRESSION_MATCHER}`;
  }
  return `${type}${ID_NAME_MATCHER} ${CALL_EXPRESSION_MATCHER}`;
}

function report(context, sourceCode, node, id) {
  if (isAllowed(context, sourceCode, node, id, RULE_NAME)) {
    return;
  }
  const loc = id && id.loc ? getLoc(id) : {};
  return context.report({
    node,
    ...loc,
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

const CALL_EXPRESSION_MATCHER = `CallExpression:matches([callee.name=/^use[A-Z]/])`;
const ID_NAME_MATCHER = `:not([id.name=${USE_MATCHER}])`;
