import vest, { test, enforce } from 'vest';

const v = vest.create('playground', (data = {}) => {
  test('username', 'Must not be empty', () => {
    enforce(data.username).isNotEmpty();
  });
});

v({
  username: 'ealush',
});

console.log(v.get());
