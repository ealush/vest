import { createSuite, test, group } from 'vest-5';

describe('base scenario', () => {
  it('Should reflect correct structure', () => {
    const suite = createSuite('user', () => {
      test('username', 'username is required', () => {});

      group('some group', () => {
        test('password', 'password is too short', () => {});
        test('password', 'password is too short', () => {});
      });
    });

    console.log(suite());
  });
});
