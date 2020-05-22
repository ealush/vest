const { VEST_KEYWORD, VEST_IDENTIFIER_TEST } = require('../../constants');
const { closest } = require('../../helpers');
const { isTestCall, looksLikeExclusion, errorMessage } = require('./helpers');

module.exports = {
  meta: {
    docs: {
      type: 'problem',
      description:
        'Makes sure vest exclusion hooks are not put before your test calls',
      category: 'Possible Errors',
      recommended: true,
    },
    fixable: 'code',
  },

  create(context) {
    return {
      CallExpression(node) {
        if (!looksLikeExclusion(node.callee)) {
          return;
        }

        const { name } = node.callee.property;

        const scope = context.getScope();
        const res = scope.references.reduce(
          (accumulator, reference) => {
            const { identifier } = reference;

            // Shouldn't really happen
            if (!identifier) {
              return accumulator;
            }

            // Checks if current reference is a reference we care about.
            if (
              identifier.name !== VEST_KEYWORD &&
              identifier.name !== VEST_IDENTIFIER_TEST
            ) {
              return accumulator;
            }

            // If current reference is the first `test` call
            // Sets `firstTest` to current index so we know not
            // To allow any more exclusion hooks
            if (isTestCall(identifier)) {
              return {
                ...accumulator,
                firstTest: accumulator.firstTest
                  ? accumulator.firstTest
                  : identifier,
              };
            }

            // If the current reference belongs to the current node
            // And `test` was already called, mark shouldWarn as true.
            if (accumulator.firstTest) {
              return {
                ...accumulator,
                shouldWarn: true,
              };
            }

            // All good. Carry on.
            return accumulator;
          },
          {
            firstTest: null,
            shouldWarn: false,
          }
        );

        // No warnings.
        if (!res.shouldWarn) {
          return;
        }

        const callExpression = closest(node, 'ExpressionStatement');

        context.report({
          node: callExpression,
          message: errorMessage(name),
          fix(fixer) {
            const sourceCode = context.getSourceCode();
            const text = sourceCode.getText(callExpression);
            return [
              fixer.remove(callExpression),
              fixer.insertTextBefore(
                closest(res.firstTest, 'ExpressionStatement'),
                `${text}\n`
              ),
            ];
          },
        });
      },
    };
  },
};
