import { StandardSchemaV1 } from 'vest-utils/standardSchemaSpec';

import { RuleRunReturn } from './RuleRunReturn';
import type { IssueConfig } from '../issue';

/**
 * Represents a lazy validation rule that can be executed with a value.
 * RuleInstances support chaining and can be reused across multiple validations.
 * Implements StandardSchemaV1 for interoperability with other schema libraries.
 *
 * @template T - The output type this rule produces (may differ from input when parsers are used)
 * @template Args - The argument types for this rule (Args[0] is the input type)
 *
 * @example
 * ```typescript
 * const stringRule = enforce.isString();
 *
 * // Test returns boolean
 * stringRule.test('hello'); // true
 * stringRule.test(123); // false
 *
 * // StandardSchema validate method
 * const schemaResult = stringRule.validate('hello');
 * console.log(schemaResult.value); // 'hello'
 * ```
 */
export class RuleInstance<T, Args extends any[] = any[]> {
  // The runtime object produced by create() supports dynamic chaining.

  [key: string]: any;

  // Type-only property for inference of rule return type
  // (not used at runtime, assigned in create())
  infer!: T;

  // Type-only declaration for the test function shape (returns boolean)
  test!: (...args: Args) => boolean;

  // Internal compatibility method - returns RuleRunReturn format
  run!: (...args: Args) => RuleRunReturn<T>;

  // Type-only declaration for the StandardSchema validate method
  validate!: (...args: Args) => StandardSchemaV1.Result<T>;

  // Type-only declaration for parse helper that throws on issues
  parse!: (...args: Args) => T;

  issue!: (config: IssueConfig) => this;

  // Type-only declaration for StandardSchema property.
  // The intersection with `{ readonly types: ... }` narrows `types` from optional
  // (as declared in StandardSchemaV1.Props) to required. This is safe because
  // RuleInstance.create() always sets `types` at runtime, and it enables
  // TypeScript's conditional type inference in `InferSchemaData<S>` and
  // `InferSchemaOutput<S>` to correctly extract `input` (Args[0]) vs `output` (T)
  // — which is critical for parser chains where input and output types differ
  // (e.g., isNumeric().toNumber(): input = string | number, output = number).
  '~standard'!: StandardSchemaV1.Props<Args[0], T> & {
    readonly types: StandardSchemaV1.Types<Args[0], T>;
  };

  private constructor() {}

  /**
   * Creates a new RuleInstance from a validation function.
   * The created instance provides `test()`, `validate()` methods
   * and the `~standard` property for StandardSchema compliance.
   *
   * @param rule - Validation function that returns a RuleRunReturn
   * @returns A new RuleInstance that can be executed with values
   */
  static create<R extends RuleInstance<T, Args>, T, Args extends any[]>(
    rule: (...args: Args) => RuleRunReturn<T>,
  ): R {
    const validate = (...args: Args): StandardSchemaV1.Result<T> => {
      const result = rule(...args);
      if (result.pass) {
        return { value: result.type };
      }
      return {
        issues: [
          {
            ...(result.issue ?? {
              message: result.message || 'Validation failed',
            }),
            path: result.path || [],
          },
        ],
      };
    };

    // Internal compatibility method - wraps validate and converts result back
    const run = (...args: Args): RuleRunReturn<T> => {
      return rule(...args);
    };

    const parse = (...args: Args): T => {
      const result = validate(...args);
      if (!result.issues) {
        return result.value;
      }

      const [firstIssue] = result.issues;
      throw new TypeError(firstIssue?.message || 'Validation failed');
    };

    return {
      '~standard': {
        types: {
          input: undefined as unknown as Args[0],
          output: undefined as unknown as T,
        },
        validate,
        vendor: 'n4s',
        version: 1 as const,
      },
      infer: {} as T,
      parse,
      run,
      test: (...args: Args) => {
        const result = validate(...args);
        return !result.issues;
      },
      validate,
    } as unknown as R;
  }
}
