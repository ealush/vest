/**
 * @type {{ rules: Record<string, import('eslint').Rule.RuleModule> }}
 */
module.exports = {
  rules: {
    'use-use': require('./rules/use-use'),
  },
};
