import wait from 'wait';

import * as vest from 'vest';

describe('portal', () => {
  it('should run portal', async () => {
    const suite = vest.create('suite', () => {
      vest.portal<ServerResponse>(res => {
        vest.test('username', 'Username is taken', () => {
          vest.enforce(res.userNameTaken).isFalsy();
        });
      });
    });

    suite().portal<ServerResponse>(async () => {
      await wait(1000);

      return {
        userNameTaken: true,
      };
    });
  });
});

type ServerResponse = {
  userNameTaken?: boolean;
};
