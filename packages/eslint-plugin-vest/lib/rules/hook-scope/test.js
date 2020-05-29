const RuleTester = require('eslint').RuleTester;
const {
  VEST_HOOK_WARN,
  VEST_HOOK_ONLY,
  VEST_HOOK_SKIP,
} = require('../../constants');
const { hookScopeErrorMessage } = require('./helpers');
const hooksScopeRule = require('.');

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2015 } });

const ERROR_WARN = hookScopeErrorMessage(VEST_HOOK_WARN);
const ERROR_ONLY = hookScopeErrorMessage(VEST_HOOK_ONLY);
const ERROR_SKIP = hookScopeErrorMessage(VEST_HOOK_SKIP);

const VALID = [
  `validate('example', () => {
    test(() => {
        vest.warn();
    });
});`,
  `test(() => {
  vest.warn();
});`,
  `validate('example', () => {
    vest.only();
});`,
  `validate('example', () => {
    vest.skip();
});`,
].map(code => ({ code }));

const INVALID_WARN = [
  `validate('example', () => {
    vest.warn();
});`,
  `vest.warn();`,
  `setTimeout(() => {
    vest.warn();
})`,
].map(code => ({ code, errors: [ERROR_WARN] }));

const INVALID_ONLY = [
  `vest.only();`,
  `vest.test(() => {
        vest.only();
    });`,
].map(code => ({ code, errors: [ERROR_ONLY] }));

const INVALID_SKIP = [
  `vest.skip();`,
  `vest.test(() => {
        vest.skip();
    });`,
].map(code => ({ code, errors: [ERROR_SKIP] }));

ruleTester.run('vest-hooks-scope', hooksScopeRule, {
  valid: VALID,
  invalid: [].concat(INVALID_WARN, INVALID_ONLY, INVALID_SKIP),
});
