import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s-schema';
import 'email';

describe('isEmail', () => {
  describe('Type compatibility', () => {
    it('Should work in eager mode (value-first)', () => {
      // Type test: these should compile without errors
      enforce('abc@xyz.com').isEmail();
      enforce('user.name@mail.example.com').isEmail();
      enforce('Display Name <user@example.com>').isEmail({
        allow_display_name: true,
      });
      enforce('user@192.168.0.1').isEmail({ allow_ip_domain: true });
    });

    it('Should work in lazy mode (builder pattern)', () => {
      // Type test: these should compile without errors
      const emailRule = enforce.isEmail();
      expect(emailRule.test('abc@xyz.com')).toBe(true);
      expect(emailRule.run('abc@xyz.com').pass).toBe(true);
      expect(emailRule.test('abc@xyz')).toBe(false);
      expect(emailRule.run('abc@xyz').pass).toBe(false);

      const emailWithOptionsRule = enforce.isEmail({
        allow_display_name: true,
      });
      expect(emailWithOptionsRule.test('Display Name <user@example.com>')).toBe(
        true,
      );
      expect(
        emailWithOptionsRule.run('Display Name <user@example.com>').pass,
      ).toBe(true);
      expect(emailWithOptionsRule.test('user@example.com')).toBe(true);
      expect(emailWithOptionsRule.run('user@example.com').pass).toBe(true);

      const emailWithIPRule = enforce.isEmail({ allow_ip_domain: true });
      expect(emailWithIPRule.test('user@192.168.0.1')).toBe(true);
      expect(emailWithIPRule.run('user@192.168.0.1').pass).toBe(true);
      expect(emailWithIPRule.test('user@example.com')).toBe(true);
      expect(emailWithIPRule.run('user@example.com').pass).toBe(true);
    });
  });
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
