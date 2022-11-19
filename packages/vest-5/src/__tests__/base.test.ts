import { createSuite, test, group } from 'vest-5';

describe('base scenario', () => {
  it('Should reflect correct structure', () => {
    const suite = createSuite('user', () => {
      test('username', 'username is required', () => false);

      group('some group', () => {
        test('password', 'password is too short', () => false);
        test('password', 'password is too short', () => {});
      });
    });

    console.log(suite());
  });
});
