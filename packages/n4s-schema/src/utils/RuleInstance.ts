import { RuleRunReturn } from 'RuleRunReturn';

/**
 * Represents a lazy validation rule that can be executed with a value.
 * RuleInstances support chaining and can be reused across multiple validations.
 * 
 * @template T - The type of value this rule validates
 * @template Args - The argument types for this rule (first arg is always the value)
 * 
 * @example
 * ```typescript
 * const stringRule = enforce.isString();
 * 
 * // Test returns boolean
 * stringRule.test('hello'); // true
 * stringRule.test(123); // false
 * 
 * // Run returns detailed result
 * const result = stringRule.run('hello');
 * console.log(result.pass); // true
 * console.log(result.type); // 'hello'
 * ```
 */
export class RuleInstance<T, Args extends any[] = any[]> {
  // The runtime object produced by create() supports dynamic chaining.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;

  // Type-only property for inference of rule return type
  // (not used at runtime, assigned in create())
  infer!: T;

  // Type-only declaration for the run function shape
  run!: (...args: Args) => RuleRunReturn<T>;

  // Type-only declaration for the test function shape (returns boolean)
  test!: (...args: Args) => boolean;

  private constructor() {}

  /**
   * Creates a new RuleInstance from a validation function.
   * The created instance provides both `run()` and `test()` methods.
   * 
   * @param rule - Validation function that returns a RuleRunReturn
   * @returns A new RuleInstance that can be executed with values
   */
  static create<R extends RuleInstance<T, Args>, T, Args extends any[]>(
    rule: (...args: Args) => RuleRunReturn<T>,
  ): R {
    return {
      run: (...args: Args) => rule(...args),
      test: (...args: Args) => rule(...args).pass,
      infer: {} as T,
    } as R;
  }
}
