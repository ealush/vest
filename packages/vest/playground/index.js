const vest = require('../dist/vest.min.js');

const { test, enforce } = vest;

console.log('Vest version: ', vest.VERSION);
console.log('--Start playing 🎲--');

const validator = only => {
  const validate = vest.create('suite_1', () => {
    vest.only(only);

    test('field_1', 'field_1 message', () => false);
    test('field_2', 'field_2 message', () => false);
    test('field_3', 'field_3 message', () => false);
    test('field_4', 'field_4 message', () => false);
    test('field_5', 'field_5 message', () => false);
  });

  return validate();
};

let res = validator('field_1');
res = validator('field_2').done(console.log);

console.log(res);
