import isProxySupported from 'isProxySupported';

describe('isProxySupported', () => {
  describe('When proxy is supported', () => {
    it('should return true', () => {
      expect(isProxySupported()).toBe(true);
    });
  });

  describe('When proxy is not supported', () => {
    describe('When Proxy is undefined', () => {
      beforeEach(() => {
        Object.defineProperty(global, 'Proxy', {
          value: undefined,
          configurable: true,
        });
      });

      it('should return false', () => {
        expect(isProxySupported()).toBe(false);
      });
    });

    describe('When proxy property does not exist on global object', () => {
      beforeEach(() => {
        // @ts-ignore
        delete global.Proxy;
      });

      it('should return false', () => {
        expect(isProxySupported()).toBe(false);
      });
    });
  });
});
