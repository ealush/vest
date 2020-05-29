const {
  VEST_IDENTIFIER_TEST,
  VEST_EXCLUSIVE_HOOKS,
  VEST_KEYWORD,
} = require('../../constants');
const { looksLike } = require('../../helpers');

const isTestCall = node =>
  looksLike(node, {
    parent: { type: 'CallExpression' },
    name: VEST_IDENTIFIER_TEST,
  });

const looksLikeExclusion = node => {
  if (node.type !== 'MemberExpression') {
    return false;
  }
  return VEST_EXCLUSIVE_HOOKS.map(hookName => ({
    object: { name: VEST_KEYWORD, type: 'Identifier' },
    property: { name: hookName, type: 'Identifier' },
  })).some(shape => looksLike(node, shape));
};

const errorMessage = name =>
  `\`${name}\` hook found after a test call. This may lead to missed exclusion, or unnecessary validation runs which may impact performance.`;

module.exports = {
  isTestCall,
  looksLikeExclusion,
  errorMessage,
};
