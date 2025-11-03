/* eslint-disable no-console, @typescript-eslint/no-namespace */
/**
 * This file demonstrates how to extend n4s with custom rules
 * that have full type support in both eager and lazy modes.
 */

import { enforce } from 'enforce';

// Step 1: Declare your custom rules in the global n4s namespace
declare global {
  namespace n4s {
    interface ValueFirstRules {
      // Define your custom rules with proper typing (value-first signature)
      isPositive: (value: number) => boolean;
      isEmail: (value: string) => boolean | { pass: boolean; message?: string };
      isBetween: (value: number, min: number, max: number) => boolean;
    }
  }
}

// Step 2: Implement your custom rules
const customRules = {
  isPositive: (value: number) => value > 0,
  isEmail: (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || {
      pass: false,
      message: 'Invalid email format',
    },
  isBetween: (value: number, min: number, max: number) =>
    value >= min && value <= max,
};

// Step 3: Extend enforce with your custom rules
enforce.extend(customRules);

// Step 4: Use your custom rules with full type support!

// Eager mode examples:
try {
  enforce(5).isPositive(); // ✓ Passes
  enforce(-1).isPositive(); // ✗ Throws error
} catch (e) {
  console.log('Caught error:', e);
}

try {
  enforce('user@example.com').isEmail(); // ✓ Passes
  enforce('invalid-email').isEmail(); // ✗ Throws error with custom message
} catch (e) {
  console.log('Caught error:', e);
}

try {
  enforce(5).isBetween(1, 10); // ✓ Passes
  enforce(15).isBetween(1, 10); // ✗ Throws error
} catch (e) {
  console.log('Caught error:', e);
}

// Lazy mode examples:
const positiveRule = enforce.isPositive();
console.log(positiveRule.run(5)); // { pass: true, type: 5 }
console.log(positiveRule.run(-1)); // { pass: false, type: -1 }

const emailRule = enforce.isEmail();
console.log(emailRule.run('user@example.com')); // { pass: true, type: 'user@example.com' }
console.log(emailRule.run('invalid')); // { pass: false, type: 'invalid' }

const betweenRule = enforce.isBetween(1, 10);
console.log(betweenRule.run(5)); // { pass: true, type: 5 }
console.log(betweenRule.run(15)); // { pass: false, type: 15 }

// Chaining custom rules with built-in rules:
const complexRule = enforce.isNumber().isPositive().isBetween(1, 100);
console.log(complexRule.run(50)); // { pass: true, type: 50 }
console.log(complexRule.run(-5)); // { pass: false, type: -5 }
console.log(complexRule.run(150)); // { pass: false, type: 150 }

// Custom messages work too:
try {
  enforce(5).message('Value must be positive').isPositive(); // ✓ Passes
  enforce(-1).message('Value must be positive').isPositive(); // ✗ Throws with custom message
} catch (e) {
  console.log('Caught error:', e);
}
