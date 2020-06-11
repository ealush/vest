const vest = require('../dist/vest.min.js');
const classNames = require('../classNames');

const { test, group } = vest;

console.log('Vest version: ', vest.VERSION);
console.log('--Start playing 🎲--');

const validate = vest.create('suite_1', only => {
  vest.only(only);

  test('field_1', 'field_1 message', () => false);
  test('field_2', 'field_2 message', () => false);
  test('field_3', 'field_3 message', () => {
    vest.warn();
    return false;
  });
  test('field_4', 'field_4 message', () => {});
  test('field_5', 'field_5 message', () => false);

  group('some-group', () => {
    test('1', () => false);
  });
});

let res = validate();

console.log(res);

const cn = classNames(res, {
  invalid: 'invalid',
  tested: 'tested',
  untested: 'untested',
  warning: 'warning',
});

console.log(cn('field_3'));
