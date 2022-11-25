import { createSuite, test as vestTest, include, only } from 'vest-5';

describe('base scenario', () => {
  it('Should reflect correct structure', () => {
    const suite = createSuite('user', () => {
      only('username');

      include('password').when('username');

      vestTest('username', () => false);
      vestTest('password', 'password is too short', () => false);
    });

    // console.log(suite());

    suite();
    suite().done(console.log);
  });
});
