const RuleTester = require('eslint').RuleTester;
const { VEST_HOOK_ONLY, VEST_HOOK_SKIP } = require('../../constants');
const { errorMessage } = require('./helpers');

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2015 } });
const excludeBeforeTest = require('.');

const valid = [
  `vest.only();`,
  `vest.skip();`,
  `vest.warn();`,
  `validate('example', () => {
    vest.only();
    test();
  });`,
  `validate('example', () => {
    vest.skip();
    test();
  });`,
].map(code => ({ code }));

const INVALID = [VEST_HOOK_ONLY, VEST_HOOK_SKIP].map(hookName =>
  [
    [
      `validate('', () => {
test();
vest.${hookName}();
});`,
      `validate('', () => {
vest.${hookName}();
test();

});`,
    ],
    [
      `validate('', () => {
test();
vest.${hookName}();
test();
});`,
      `validate('', () => {
vest.${hookName}();
test();

test();
});`,
    ],
  ].map(([code, output]) => ({
    code,
    output,
    errors: [errorMessage(hookName)],
  }))
);

ruleTester.run('vest-exclude-before-test', excludeBeforeTest, {
  valid,
  invalid: [].concat(...INVALID),
});
