/**
 * @fileoverview makes sure vest hooks are placed in the right place
 * @author ealush
 */
'use strict';

const { ALL_VEST_HOOKS, VEST_KEYWORD } = require('../../constants');
const { closest, looksLike } = require('../../helpers');
const { correctWrapperName, hookScopeErrorMessage } = require('./helpers');

const isHookParentShape = (node, name) =>
  looksLike(node, {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: VEST_KEYWORD,
      },
      property: {
        type: 'Identifier',
        name,
      },
    },
  });

const functionScopeShape = name => ({
  type: 'CallExpression',
  callee: {
    type: 'Identifier',
    name: correctWrapperName(name),
  },
});

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Makes sure vest hooks are put in the right place',
      category: 'Possible Errors',
      recommended: true,
    },
  },

  create(context) {
    return {
      Identifier(node) {
        const name = node.name;

        // Checks if found identifier is a vest hook.
        if (!ALL_VEST_HOOKS.includes(node.name)) {
          return;
        }

        // Finds closest `CallExpression` node
        // If correct, it is the hook itself, preceeded with `vest.`.
        const closestCallExpression = closest(node, 'CallExpression');

        // Makes sure it looks like `vest.${hook_name}()` - e.g. vest.warn().
        if (!isHookParentShape(closestCallExpression, name)) {
          return;
        }

        // Finds the currently run function
        // Not the callback, but the function which takes the callback
        const parentExpression = closest(
          closestCallExpression.parent,
          'CallExpression'
        );

        // Makes sure it is the correct wrapping function
        if (looksLike(parentExpression, functionScopeShape(name))) {
          return;
        }

        // Report an error
        context.report({
          node: closestCallExpression,
          message: hookScopeErrorMessage(name),
        });
      },
    };
  },
};
