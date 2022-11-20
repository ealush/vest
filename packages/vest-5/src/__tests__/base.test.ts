import wait from 'wait';

import { createSuite, test as vestTest, group } from 'vest-5';

describe('base scenario', () => {
  it('Should reflect correct structure', done => {
    const suite = createSuite('user', () => {
      vestTest('password', 'password is too short', () => {});
      vestTest('username', 'username is required', () => {});
      vestTest('password', 'password is too short', async () => {
        await wait(2500);
      });

      group('some group', () => {});
    });

    // console.log(suite());

    suite()
      .done(() => {
        console.log('all tests are done');
        done();
      })
      .done('username', () => {
        console.log('username is done');
      })
      .done('password', () => {
        console.log('password is done');
      });
  });
});
