import path from 'path';

import { isAllowed } from './common/directives.js';
import { USE_MATCHER, VAR_DEC, FUNC_DEC } from './common/matchers.js';
import { findAncestor, getLoc } from './common/selectors.js';

const RULE_NAME = path.basename(
  new URL('', import.meta.url).pathname,
  path.extname(new URL('', import.meta.url).pathname),
);

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
    return {
      [matcher(FUNC_DEC)]() {
        const parentFunction = findAncestor(context, FUNC_DEC);

        if (parentFunction && !parentFunction.id.name.match(USE_MATCHER)) {
          report(context, parentFunction, parentFunction.id);
        }
      },
      [matcher(VAR_DEC)]() {
        const parentFunction = findAncestor(context, 'ArrowFunctionExpression');

        if (parentFunction) {
          const variableDeclarator = findAncestor(context, VAR_DEC);

          report(context, parentFunction, variableDeclarator.id);
        }
      },
    };
  },
};

/**
 * Builds a selector for the rule to match specific nodes.
 * @param {string} type AST node type.
 * @returns {string}
 */
function matcher(type) {
  if (type === VAR_DEC) {
    return `${type}${ID_NAME_MATCHER} > ArrowFunctionExpression ${CALL_EXPRESSION_MATCHER}`;
  }
  return `${type}${ID_NAME_MATCHER} ${CALL_EXPRESSION_MATCHER}`;
}

/**
 * Reports a rule violation with a suggestion.
 * @param {import('eslint').Rule.RuleContext} context ESLint rule context.
 * @param {any} node Node to highlight.
 * @param {any} id Identifier node to rename.
 */
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

/**
 * Prefixes an identifier with "use" while preserving casing.
 * @param {string} name Identifier name.
 * @returns {string}
 */
function addUseToName(name) {
  return `use${name[0].toUpperCase()}${name.slice(1)}`;
}

const suggest = "Rename function to start with 'use'";

const message =
  "Function {{ identifier }} does not start with 'use' but contains a call to function that starts with 'use'";

const CALL_EXPRESSION_MATCHER = `CallExpression:matches([callee.name=/^use[A-Z]/])`;
const ID_NAME_MATCHER = `:not([id.name=${USE_MATCHER}])`;
