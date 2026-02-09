import { enforce } from 'n4s';
import { describe, it, expect, vi } from 'vitest';

import { create, test } from '../../vest';

describe('create accepts schema argument', () => {
  it('suite runs with schema as second argument', () => {
    const schema = enforce.shape({
      email: enforce.isString(),
      age: enforce.isNumber(),
    });
    const callback = vi.fn();
    const suite = create(callback, schema);
    const data = { email: 'user@example.com', age: 32 };
    suite.run(data);
    expect(callback).toHaveBeenCalledWith(data);
  });

  it('suite runs without schema (backwards compatibility)', () => {
    const callback = vi.fn();
    const suite = create(callback);
    suite.run('anything', 123);
    expect(callback).toHaveBeenCalledWith('anything', 123);
  });

  it('suite runs with undefined schema', () => {
    const callback = vi.fn();
    const suite = create(callback, undefined);
    suite.run('test');
    expect(callback).toHaveBeenCalledWith('test');
  });

  it('suite runs with null schema', () => {
    const callback = vi.fn();
    const suite = create(callback, null);
    suite.run('test');
    expect(callback).toHaveBeenCalledWith('test');
  });

  it('should validate dynamically focused fields in iteration', () => {
    const contactSuite = create(
      data => {
        test('firstName', 'First name is required', () => {
          enforce(data.firstName).isNotBlank();
        });

        test('firstName', 'First name must be at least 4 chars', () => {
          enforce(data.firstName).longerThan(3);
        });

        test('lastName', 'Last name is required', () => {
          enforce(data.lastName).isNotBlank();
        });

        test('phoneNumber', 'Phone number is required', () => {
          enforce(data.phoneNumber).isNotBlank();
        });

        test('email', 'Email is required', () => {
          enforce(data.email).isNotBlank();
        });
      },
      enforce.shape({
        firstName: enforce.isString(),
        lastName: enforce.isString(),
        phoneNumber: enforce.isString(),
        email: enforce.isString(),
      }),
    );

    const fieldsToValidate: [string, string][] = [
      ['firstName', 'John'],
      ['lastName', 'Doe'],
      ['phoneNumber', '555-1234'],
      ['email', 'john@example.com'],
    ];

    // Validate each field dynamically
    fieldsToValidate.forEach(([name, value]) => {
      const result = contactSuite.focus({ only: name }).run({
        [name]: value,
      });

      // Each focused field should pass validation
      expect(result.hasErrors(name)).toBe(false);
      expect(result.isValidByGroup(name)).toBe(true);
    });

    // After all iterations, ensure the suite state reflects all validations
    const finalResult = contactSuite.get();
    expect(finalResult.hasErrors()).toBe(false);
    expect(finalResult.testCount).toBe(5); // 2 firstName + 1 lastName + 1 phoneNumber + 1 email
  });

  it('should accumulate errors across dynamically focused field validations', () => {
    const contactSuite = create(
      data => {
        test('firstName', 'First name is required', () => {
          enforce(data.firstName).isNotBlank();
        });

        test('firstName', 'First name must be at least 4 chars', () => {
          enforce(data.firstName).longerThan(3);
        });

        test('lastName', 'Last name is required', () => {
          enforce(data.lastName).isNotBlank();
        });

        test('phoneNumber', 'Phone number is required', () => {
          enforce(data.phoneNumber).isNotBlank();
        });

        test('email', 'Email is required', () => {
          enforce(data.email).isNotBlank();
        });
      },
      enforce.shape({
        firstName: enforce.isString(),
        lastName: enforce.isString(),
        phoneNumber: enforce.isString(),
        email: enforce.isString(),
      }),
    );

    // Some fields will fail validation
    const fieldsToValidate: [string, string][] = [
      ['firstName', 'Jo'], // Too short - will fail "longerThan(3)"
      ['lastName', ''], // Blank - will fail "isNotBlank"
      ['phoneNumber', '555-1234'], // Valid
      ['email', ''], // Blank - will fail "isNotBlank"
    ];

    const results: { name: string; hasError: boolean }[] = [];

    fieldsToValidate.forEach(([name, value]) => {
      const result = contactSuite.focus({ only: name }).run({
        [name]: value,
      });

      results.push({ name, hasError: result.hasErrors(name) });
    });

    // Check individual field results
    expect(results.find(r => r.name === 'firstName')?.hasError).toBe(true); // fails longerThan
    expect(results.find(r => r.name === 'lastName')?.hasError).toBe(true); // fails isNotBlank
    expect(results.find(r => r.name === 'phoneNumber')?.hasError).toBe(false); // passes
    expect(results.find(r => r.name === 'email')?.hasError).toBe(true); // fails isNotBlank

    // Final state should have all errors accumulated
    const finalResult = contactSuite.get();
    expect(finalResult.hasErrors()).toBe(true);
    expect(finalResult.hasErrors('firstName')).toBe(true);
    expect(finalResult.hasErrors('lastName')).toBe(true);
    expect(finalResult.hasErrors('phoneNumber')).toBe(false);
    expect(finalResult.hasErrors('email')).toBe(true);
  });
  it('should validate fields one by one with manual focus and run', () => {
    const contactSuite = create(
      data => {
        test('firstName', 'First name is required', () => {
          enforce(data.firstName).isNotBlank();
        });

        test('firstName', 'First name must be at least 4 chars', () => {
          enforce(data.firstName).longerThan(3);
        });

        test('lastName', 'Last name is required', () => {
          enforce(data.lastName).isNotBlank();
        });

        test('phoneNumber', 'Phone number is required', () => {
          enforce(data.phoneNumber).isNotBlank();
        });

        test('email', 'Email is required', () => {
          enforce(data.email).isNotBlank();
        });
      },
      enforce.shape({
        firstName: enforce.isString(),
        lastName: enforce.isString(),
        phoneNumber: enforce.isString(),
        email: enforce.isString(),
      }),
    );

    // Validate firstName
    let result = contactSuite.focus({ only: 'firstName' }).run({
      firstName: 'John',
    });
    expect(result.isValid('firstName')).toBe(true);
    expect(result.hasErrors('firstName')).toBe(false);

    // Validate lastName
    result = contactSuite.focus({ only: 'lastName' }).run({
      lastName: 'Doe',
    });
    expect(result.isValid('lastName')).toBe(true);
    expect(result.hasErrors('lastName')).toBe(false);

    // Validate phoneNumber
    result = contactSuite.focus({ only: 'phoneNumber' }).run({
      phoneNumber: '555-1234',
    });
    expect(result.isValid('phoneNumber')).toBe(true);
    expect(result.hasErrors('phoneNumber')).toBe(false);

    // Validate email
    result = contactSuite.focus({ only: 'email' }).run({
      email: 'john@example.com',
    });
    expect(result.isValid('email')).toBe(true);
    expect(result.hasErrors('email')).toBe(false);

    // Final check
    expect(contactSuite.get().isValid()).toBe(true);
  });

  describe('Strict schema enforcement', () => {
    const strictSuite = create(
      () => {},
      enforce.shape({
        requiredField: enforce.isString(),
        otherField: enforce.isNumber(),
      }),
    );

    it('should fail validation when run() is called with partial data', () => {
      // @ts-expect-error - Intentionally passing partial data to test runtime strictness
      const result = strictSuite.run({
        requiredField: 'present',
      });

      expect(result.isValid()).toBe(false);
      expect(result.hasErrors('otherField')).toBe(true);
    });

    it('should fail validation when runStatic() is called with partial data', () => {
      // @ts-expect-error - Intentionally passing partial data to test runtime strictness
      const result = strictSuite.runStatic({
        requiredField: 'present',
      });

      expect(result.isValid()).toBe(false);
      expect(result.hasErrors('otherField')).toBe(true);
    });
  });
});
