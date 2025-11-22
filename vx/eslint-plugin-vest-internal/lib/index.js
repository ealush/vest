/**
 * @type {{ rules: Record<string, import('eslint').Rule.RuleModule> }}
 */
import useUse from './rules/use-use.js';

export default {
  rules: {
    'use-use': useUse,
  },
};

export const rules = {
  'use-use': useUse,
};
