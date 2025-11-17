import { isBoolean, Stringable, dynamicValue } from 'vest-utils';

/**
 * Represents the result of a validation rule execution.
 * Contains the pass/fail status, the validated type, and an optional error message.
 *
 * @template T - The type of value that was validated
 *
 * @example
 * ```typescript
 * const result = RuleRunReturn.Passing('hello');
 * console.log(result.pass); // true
 * console.log(result.type); // 'hello'
 *
 * const failed = RuleRunReturn.Failing(123, 'Must be positive');
 * console.log(failed.pass); // false
 * console.log(failed.message); // 'Must be positive'
 * ```
 */
export class RuleRunReturn<T> {
  /** Whether the validation passed */
  pass: boolean;
  /** The validated value's type */
  type: T;
  /** Optional error message if validation failed */
  message?: string;
  path?: string[];

  constructor(pass: boolean, type: T, message?: string) {
    this.pass = pass;
    this.type = type;
    this.message = message;
  }

  /**
   * Creates a RuleRunReturn from a boolean or existing RuleRunReturn.
   * Handles message resolution and type coercion.
   *
   * @param pass - Boolean indicating success, or existing RuleRunReturn
   * @param type - The type of the validated value
   * @param message - Optional error message (can be string or function)
   * @returns A new RuleRunReturn instance
   */
  static create<T>(
    pass: boolean | RuleRunReturn<T>,
    type: T,
    message?: Stringable,
  ): RuleRunReturn<T> {
    if (isBoolean(pass)) {
      return new RuleRunReturn(!!pass, type, dynamicValue(message, type));
    }
    return RuleRunReturn.fromObject(pass, type, message);
  }

  private static fromObject<T>(
    pass: any,
    type: T,
    message?: Stringable,
  ): RuleRunReturn<T> {
    const hasValidObject = pass && isBoolean(pass.pass);

    if (!hasValidObject) {
      return new RuleRunReturn(false, type, dynamicValue(message, type));
    }

    const res = new RuleRunReturn(
      !!pass.pass,
      type ?? pass.type,
      dynamicValue(message ?? pass.message, type),
    );

    if (pass.path) {
      res.path = pass.path;
    }

    return res;
  }

  /**
   * Creates a passing RuleRunReturn.
   *
   * @param type - The validated value's type
   * @param message - Optional success message
   * @returns A RuleRunReturn with pass=true
   *
   * @example
   * ```typescript
   * const result = RuleRunReturn.Passing('valid');
   * console.log(result.pass); // true
   * ```
   */
  static Passing<T>(type: T, message?: Stringable): RuleRunReturn<T> {
    return RuleRunReturn.create(true, type, message);
  }

  /**
   * Creates a failing RuleRunReturn.
   *
   * @param type - The validated value's type
   * @param message - Optional error message
   * @returns A RuleRunReturn with pass=false
   *
   * @example
   * ```typescript
   * const result = RuleRunReturn.Failing(123, 'Number must be positive');
   * console.log(result.pass); // false
   * console.log(result.message); // 'Number must be positive'
   * ```
   */
  static Failing<T>(type: T, message?: Stringable): RuleRunReturn<T> {
    return RuleRunReturn.create(false, type, message);
  }
}
