import { enforce } from 'n4s';
import 'email';

describe('isEmail', () => {
  it('Should pass for valid emails', () => {
    expect(() => enforce('abc@xyz.com').isEmail()).not.toThrow();
    expect(() => enforce('user.name@mail.example.com').isEmail()).not.toThrow();
    expect(() => enforce('user@mail.example.com').isEmail()).not.toThrow();
    expect(() => enforce('user+tag@mail.example.com').isEmail()).not.toThrow();
    expect(() =>
      enforce('verylongemailaddress1234567890@mail.example.com').isEmail(),
    ).not.toThrow();
    expect(() => enforce('user@example.co').isEmail()).not.toThrow();
    expect(() => enforce('user@example.io').isEmail()).not.toThrow();
  });

  it('Should fail for invalid emails', () => {
    expect(() => enforce('abc@xyz').isEmail()).toThrow();
    expect(() => enforce('user@mail..example.com').isEmail()).toThrow();
    expect(() => enforce('user@.example.com').isEmail()).toThrow();
    expect(() => enforce('user@example').isEmail()).toThrow();
    expect(() => enforce('user@example.').isEmail()).toThrow();
    expect(() => enforce('user@examplecom').isEmail()).toThrow();
    expect(() => enforce('user@.com').isEmail()).toThrow();
    expect(() => enforce('user@example.123').isEmail()).toThrow();
  });

  describe('With options', () => {
    it('Should pass for valid emails', () => {
      expect(() =>
        enforce('Display Name <user@example.com>').isEmail({
          allow_display_name: true,
        }),
      ).not.toThrow();
      expect(() =>
        enforce('Display Name <user@example.com>').isEmail({
          allow_display_name: true,
          require_display_name: true,
        }),
      ).not.toThrow();
      expect(() =>
        enforce('user@192.168.0.1').isEmail({ allow_ip_domain: true }),
      ).not.toThrow();
      expect(() =>
        enforce('user@example').isEmail({ require_tld: false }),
      ).not.toThrow();
    });

    it('Should fail for invalid emails', () => {
      expect(() =>
        enforce('Display Name user@example.com').isEmail({
          allow_display_name: true,
          require_display_name: true,
        }),
      ).toThrow();
      expect(() =>
        enforce('user@192.168.0.1').isEmail({ allow_ip_domain: false }),
      ).toThrow();
    });
  });
});
