import { createSuite, test as vestTest, group } from 'vest-5';

describe('base scenario', () => {
  it('Should reflect correct structure', () => {
    const suite = createSuite('user', () => {
      vestTest('username', 'username is required', () => {});

      group('some group', () => {
        vestTest('password', 'password is too short', () => {});
        vestTest('password', 'password is too short', () => {});
      });
    });

    console.log(suite());
  });
});
