import wait from 'wait';

import * as vest from 'vest';

describe('AsyncIsolate', () => {
  it('Should bla bla', async () => {
    const suite = vest.create(() => {
      vest.IsolateAsync(async () => {
        await wait(100);
        vest.test('f1', 'Field is required', () => false);
      });
    });

    suite();
    expect(suite.hasErrors('f1')).toBe(false);
    await wait(200);
    expect(suite.hasErrors('f1')).toBe(true);
  });
});
