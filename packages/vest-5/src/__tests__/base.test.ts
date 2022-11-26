import { createSuite, test as vestTest } from 'vest-5';

describe('base scenario', () => {
  it('Should reflect correct structure', () => {
    let counter = 0;
    const suite = createSuite('user', () => {
      if (counter) {
        vestTest('username', () => {
          return false;
        });
      }
      vestTest('password', 'password is too short', () => false);
      vestTest('password', 'password is too short', () => false);
      counter++;
    });

    // console.log(suite());

    suite();
    suite();

    // console.log(suite.get());
  });
});
