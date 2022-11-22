import { createSuite, test as vestTest, warn } from 'vest-5';

describe('base scenario', () => {
  it('Should reflect correct structure', () => {
    const suite = createSuite('user', () => {
      vestTest('password', 'password is too short', () => false);
      vestTest('username', () => {
        warn();
        throw 'username is required';
      });
    });

    // console.log(suite());

    const res = suite();

    console.log(
      res.isValid(),
      res.hasErrors(),
      res.hasWarnings(),
      res.getErrors(),
      res.getWarnings()
    );
  });
});
