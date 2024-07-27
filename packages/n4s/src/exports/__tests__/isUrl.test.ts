import { enforce } from 'n4s';
import 'isURL';

describe('isURL', () => {
  it('Should pass for valid URLs', () => {
    expect(() => enforce('http://www.google.com').isURL()).not.toThrow();
    expect(() => enforce('https://google.com').isURL()).not.toThrow();
    expect(() => enforce('google.com').isURL()).not.toThrow();
    expect(() =>
      enforce('https://www.wikipedia.org/wiki/Main_Page').isURL(),
    ).not.toThrow();
    expect(() => enforce('ftp://myserver.net').isURL()).not.toThrow();
    expect(() =>
      enforce('https://www.example.com/query?search=AI').isURL(),
    ).not.toThrow();
    expect(() =>
      enforce('https://username:password@hostname.com:8080').isURL(),
    ).not.toThrow();
    expect(() => enforce('http://233.233.233.233').isURL()).not.toThrow();
    expect(() =>
      enforce('https://www.example.com/foo/?bar=baz&inga=42&quux').isURL(),
    ).not.toThrow();
    expect(() =>
      enforce('http://www.example.com/index.html#section1').isURL(),
    ).not.toThrow();
  });

  it('Should fail for invalid URLs', () => {
    expect(() => enforce('').isURL()).toThrow();
    expect(() => enforce('google').isURL()).toThrow();
    expect(() => enforce('http://').isURL()).toThrow();
    expect(() => enforce('https://').isURL()).toThrow();
    expect(() => enforce('www.google.').isURL()).toThrow();
    expect(() => enforce('http://google').isURL()).toThrow();
    expect(() => enforce('https://google').isURL()).toThrow();
    expect(() => enforce('http:///www.google.com').isURL()).toThrow();
    expect(() => enforce('https:///www.google.com').isURL()).toThrow();
    expect(() => enforce('http://www.goo gle.com').isURL()).toThrow();
    expect(() => enforce('://www.google.com').isURL()).toThrow();
    expect(() => enforce('http://localhost').isURL()).toThrow();
    expect(() =>
      enforce('www.com').isURL({ require_host: false }),
    ).not.toThrow();
  });

  describe('With options', () => {
    it('should pass for valid URLs', () => {
      expect(() =>
        enforce('myprotocol://customdomain.com').isURL({
          protocols: ['myprotocol'],
        }),
      ).not.toThrow();
      expect(() =>
        enforce('http://localhost:8080').isURL({ require_tld: false }),
      ).not.toThrow();
      expect(() =>
        enforce('invalid://www.google.com').isURL({
          require_valid_protocol: false,
        }),
      ).not.toThrow();
      expect(() =>
        enforce('http://my_server.com').isURL({ allow_underscores: true }),
      ).not.toThrow();
    });

    it('should fail for invalid URLs', () => {
      expect(() =>
        enforce('myprotocol://customdomain.com').isURL({ protocols: ['http'] }),
      ).toThrow();
      expect(() =>
        enforce('http://localhost:8080').isURL({ require_tld: true }),
      ).toThrow();
      expect(() =>
        enforce('invalid://www.google.com').isURL({
          require_valid_protocol: true,
        }),
      ).toThrow();
      expect(() =>
        enforce('http://my_server.com').isURL({ allow_underscores: false }),
      ).toThrow();
      expect(() =>
        enforce('http://www.example.com/index.html#section1').isURL({
          allow_fragments: false,
        }),
      ).toThrow();
    });
  });
});
