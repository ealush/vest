import { Enforce } from 'enforce';

export function testVerifyProxy(testBody: (enforce: Enforce) => void) {
  const _proxy = global.Proxy;

  [true, false].forEach(proxyEnabled => {
    describe(`Proxy support (${proxyEnabled})`, () => {
      beforeEach(() => {
        if (!proxyEnabled) {
          // @ts-expect-error - expplicitly testing for proxy support
          delete global.proxy;
        }
        jest.resetModules();
        jest.doMock('isProxySupported', () => () => proxyEnabled);
      });

      afterEach(() => {
        jest.resetModules();
        global.Proxy = _proxy;
      });

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      testBody(require('enforce').enforce as Enforce);
    });
  });
}
