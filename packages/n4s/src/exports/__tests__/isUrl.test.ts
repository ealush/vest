import { enforce } from 'n4s';
import 'isUrl';

describe('isUrl', () => {
  it('Should pass for valid urls', () => {
    expect(() => enforce('http://www.google.com').isUrl()).not.toThrow();
    expect(() => enforce('https://google.com').isUrl()).not.toThrow();
    expect(() => enforce('google.com').isUrl()).not.toThrow();
    expect(() => enforce('https://www.wikipedia.org/wiki/Main_Page').isUrl()).not.toThrow();
    expect(() => enforce('ftp://myserver.net').isUrl()).not.toThrow();
    expect(() => enforce('https://www.example.com/query?search=AI').isUrl()).not.toThrow();
    expect(() => enforce('https://username:password@hostname.com:8080').isUrl()).not.toThrow();
    expect(() => enforce('http://233.233.233.233').isUrl()).not.toThrow();
    expect(() => enforce('https://www.example.com/foo/?bar=baz&inga=42&quux').isUrl()).not.toThrow();
    expect(() => enforce('http://www.example.com/index.html#section1').isUrl()).not.toThrow();
  });

  it('Should fail for invalid urls', () => {
    expect(() => enforce('').isUrl()).toThrow();
    expect(() => enforce('google').isUrl()).toThrow();
    expect(() => enforce('http://').isUrl()).toThrow();
    expect(() => enforce('https://').isUrl()).toThrow();
    expect(() => enforce('www.google.').isUrl()).toThrow();
    expect(() => enforce('http://google').isUrl()).toThrow();
    expect(() => enforce('https://google').isUrl()).toThrow();
    expect(() => enforce('http:///www.google.com').isUrl()).toThrow();
    expect(() => enforce('https:///www.google.com').isUrl()).toThrow();
    expect(() => enforce('http://www.goo gle.com').isUrl()).toThrow();
    expect(() => enforce('://www.google.com').isUrl()).toThrow();
    expect(() => enforce('http://localhost').isUrl()).toThrow();
    expect(() => enforce('www.com').isUrl({ require_host: false })).not.toThrow();
  })

  describe('With options', () => {
    it('should pass for valid urls', () => {
        expect(() => enforce('myprotocol://customdomain.com').isUrl({ protocols: ['myprotocol'] })).not.toThrow();
        expect(() => enforce('http://localhost:8080').isUrl({ require_tld: false })).not.toThrow();
        expect(() => enforce('invalid://www.google.com').isUrl({ require_valid_protocol: false })).not.toThrow();
        expect(() => enforce('http://my_server.com').isUrl({ allow_underscores: true })).not.toThrow();
    });

    it('should fail for invalid urls', () => {
        expect(() => enforce('myprotocol://customdomain.com').isUrl({ protocols: ['http'] })).toThrow();
        expect(() => enforce('http://localhost:8080').isUrl({ require_tld: true })).toThrow();
        expect(() => enforce('invalid://www.google.com').isUrl({ require_valid_protocol: true })).toThrow();
        expect(() => enforce('http://my_server.com').isUrl({ allow_underscores: false })).toThrow();
        expect(() => enforce('http://www.example.com/index.html#section1').isUrl({ allow_fragments: false })).toThrow();
    });
  });

});