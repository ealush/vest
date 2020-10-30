const constants = {
  VEST_HOOK_ONLY: 'only',
  VEST_HOOK_SKIP: 'skip',
  VEST_HOOK_WARN: 'warn',
  VEST_IDENTIFIER_TEST: 'test',
  VEST_IDENTIFIER_VALIDATE: 'validate',
  VEST_KEYWORD: 'vest',
};

constants.ALL_VEST_HOOKS = [
  constants.VEST_HOOK_WARN,
  constants.VEST_HOOK_ONLY,
  constants.VEST_HOOK_SKIP,
];

constants.VEST_EXCLUSIVE_HOOKS = [
  constants.VEST_HOOK_ONLY,
  constants.VEST_HOOK_SKIP,
];

module.exports = constants;
