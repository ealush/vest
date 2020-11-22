import vest, { test, group } from '../../../vest';

test('fieldName', 'some error message', () => {});
test('fieldName', () => {});
test('fieldName', 'some error message', () => false);
test('fieldName', () => false);
test('fieldName', () => Promise.resolve('some error message'));
async function someFunc() {}
test('fieldName', 'some error message', async () => {
  await someFunc();
});

test('fieldName', 'some error message', () => {
  vest.warn();
});

test.memo('fieldName', 'some error message', () => {}, []);
test.memo('fieldName', 'some error message', () => {}, ['value']);
test.memo('fieldName', () => {}, ['value']);
test.memo(
  'fieldName',
  async () => {
    await someFunc();
  },
  ['value']
);

group('name', () => {});
