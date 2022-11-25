import { createSuite, test as vestTest, only } from 'vest-5';

describe('base scenario', () => {
  it('Should reflect correct structure', () => {
    let counter = 0;
    const suite = createSuite('user', () => {
      if (counter) {
        only('xxxxxxxxxx');
      }

      // include('password').when('username');

      vestTest('username', () => {
        console.log('running');
        return false;
      });
      vestTest('password', 'password is too short', () => false);
      counter++;
    });

    // console.log(suite());

    suite();
    suite().done(console.log);
  });
});
