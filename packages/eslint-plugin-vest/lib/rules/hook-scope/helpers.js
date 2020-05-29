const {
  VEST_HOOK_WARN,
  VEST_IDENTIFIER_VALIDATE,
  VEST_IDENTIFIER_TEST,
} = require('../../constants');

const correctWrapperName = name =>
  name === VEST_HOOK_WARN ? VEST_IDENTIFIER_TEST : VEST_IDENTIFIER_VALIDATE;

const hookScopeErrorMessage = hookName =>
  `Vest hook \`${hookName}\` found in the wrong scope. This may lead to wrong validation output and unexpected behavior. Make sure you place it inside your \`${correctWrapperName(
    hookName
  )}\` callback.`;

module.exports = {
  correctWrapperName,
  hookScopeErrorMessage,
};
