export type DraftResult = Omit<IVestResult, 'done'>;

type TestCB = () => void | Promise<string | void> | false;
type DoneCB = (res: DraftResult) => void;
type ExclusionArg = string | string[] | void;

export type IVestResult = {
  name: string;
  errorCount: number;
  warnCount: number;
  testCount: number;
  tests: {
    [fieldName: string]: {
      errorCount: number;
      warnCount: number;
      testCount: number;
      errors?: string[];
      warnings?: string[];
    };
  };
  groups: {
    [groupName: string]: {
      [fieldName: string]: {
        errorCount: number;
        warnCount: number;
        testCount: number;
        errors?: string[];
        warnings?: string[];
      };
    };
  };
  /**
   * Returns whether the specified field has errors
   */
  hasErrors: (fieldName?: string) => boolean;
  /**
   * Returns whether the specified field has warnings
   */
  hasWarnings: (fieldName?: string) => boolean;
  /**
   * Returns the error messages for all fields
   */
  getErrors(): { [fieldName: string]: string[] };
  /**
   * Returns the error messages for the specified test
   */
  getErrors(fieldName: string): string[];
  /**
   * Returns the warning messages for all fields
   */
  getWarnings(): { [fieldName: string]: string[] };
  /**
   * Returns the warning messages for the specified test
   */
  getWarnings(fieldName: string): string[];

  /**
   * Returns whether the specified group has errors
   */
  hasErrorsByGroup(groupName: string): boolean;
  /**
   * Returns whether the specified group and field combination has errors
   */
  hasErrorsByGroup(groupName: string, fieldName: string): boolean;
  /**
   * Returns whether the specified group has warnings
   */
  hasWarningsByGroup(groupName: string): boolean;
  /**
   * Returns whether the specified group and field combination has warnings
   */
  hasWarningsByGroup(groupName: string, fieldName: string): boolean;

  /**
   * Returns all the error messages for the specified group
   */
  getErrorsByGroup(groupName: string): { [fieldName: string]: string[] };
  /**
   * Returns all the error messages for the specified group and field
   */
  getErrorsByGroup(groupName: string, fieldName: string): string[];
  /**
   * Returns all the warning messages for the specified group
   */
  getWarningsByGroup(groupName: string): { [fieldName: string]: string[] };
  /**
   * Returns all the warning messages for the specified group and field
   */
  getWarningsByGroup(groupName: string, fieldName: string): string[];
  /**
   * Runs a callback when all tests are finished running
   */
  done(cb: DoneCB): void;
  /**
   * Runs a callback when all tests of the specified field finished running
   */
  done(fieldName: string, cb: DoneCB): void;
};

export type EnforceExtendMap<T> = {
  [K in keyof T]: (...args: any[]) => IEnforceRules<T> & EnforceExtendMap<T>;
};

export interface IEnforceRules<T = {}> {
  equals: (expected: any) => IEnforceRules<T> & EnforceExtendMap<T>;
  notEquals: (expected: any) => IEnforceRules<T> & EnforceExtendMap<T>;
  numberEquals: (
    expected: number | string
  ) => IEnforceRules<T> & EnforceExtendMap<T>;
  greaterThan: (
    expected: number | string
  ) => IEnforceRules<T> & EnforceExtendMap<T>;
  greaterThanOrEquals: (
    expected: number | string
  ) => IEnforceRules<T> & EnforceExtendMap<T>;
  lessThan: (
    expected: number | string
  ) => IEnforceRules<T> & EnforceExtendMap<T>;
  lessThanOrEquals: (
    expected: number | string
  ) => IEnforceRules<T> & EnforceExtendMap<T>;
  longerThan: (
    expected: number | string
  ) => IEnforceRules<T> & EnforceExtendMap<T>;
  longerThanOrEquals: (
    expected: number | string
  ) => IEnforceRules<T> & EnforceExtendMap<T>;
  shorterThan: (
    expected: number | string
  ) => IEnforceRules<T> & EnforceExtendMap<T>;
  shorterThanOrEquals: (
    expected: number | string
  ) => IEnforceRules<T> & EnforceExtendMap<T>;
  gt: (expected: number | string) => IEnforceRules<T> & EnforceExtendMap<T>;
  gte: (expected: number | string) => IEnforceRules<T> & EnforceExtendMap<T>;
  lt: (expected: number | string) => IEnforceRules<T> & EnforceExtendMap<T>;
  lte: (expected: number | string) => IEnforceRules<T> & EnforceExtendMap<T>;
  endsWith: (suffix: string) => IEnforceRules<T> & EnforceExtendMap<T>;
  doesNotEndWith: (suffix: string) => IEnforceRules<T> & EnforceExtendMap<T>;
  numberNotEquals: (
    expected: number | string
  ) => IEnforceRules<T> & EnforceExtendMap<T>;
  matches: (
    expected: string | RegExp
  ) => IEnforceRules<T> & EnforceExtendMap<T>;
  notMatches: (
    expected: string | RegExp
  ) => IEnforceRules<T> & EnforceExtendMap<T>;
  isArray: () => IEnforceRules<T> & EnforceExtendMap<T>;
  isEmpty: () => IEnforceRules<T> & EnforceExtendMap<T>;
  isEven: () => IEnforceRules<T> & EnforceExtendMap<T>;
  isNumber: () => IEnforceRules<T> & EnforceExtendMap<T>;
  isNaN: () => IEnforceRules<T> & EnforceExtendMap<T>;
  isNotNaN: () => IEnforceRules<T> & EnforceExtendMap<T>;
  isNumeric: () => IEnforceRules<T> & EnforceExtendMap<T>;
  isOdd: () => IEnforceRules<T> & EnforceExtendMap<T>;
  isTruthy: () => IEnforceRules<T> & EnforceExtendMap<T>;
  isFalsy: () => IEnforceRules<T> & EnforceExtendMap<T>;
  isString: () => IEnforceRules<T> & EnforceExtendMap<T>;
  isNotArray: () => IEnforceRules<T> & EnforceExtendMap<T>;
  isNotEmpty: () => IEnforceRules<T> & EnforceExtendMap<T>;
  isNotNumber: () => IEnforceRules<T> & EnforceExtendMap<T>;
  isNotNumeric: () => IEnforceRules<T> & EnforceExtendMap<T>;
  isNotString: () => IEnforceRules<T> & EnforceExtendMap<T>;
  inside: (
    expected: Array<string | number | boolean> | string
  ) => IEnforceRules<T> & EnforceExtendMap<T>;
  notInside: (
    expected: Array<string | number | boolean> | string
  ) => IEnforceRules<T> & EnforceExtendMap<T>;
  lengthEquals: (expected: number) => IEnforceRules<T> & EnforceExtendMap<T>;
  lengthNotEquals: (expected: number) => IEnforceRules<T> & EnforceExtendMap<T>;
}

interface IEnforce {
  /**
   * Assertion function. Throws an error on failure.
   * @param value Value being enforced
   */
  (value: any): IEnforceRules;

  /**
   * Adds custom rules to enforce
   * @param rules Rules object to add onto enforce
   *
   * @example
   *
   * const customEnforce = enforce.extend({
   *  isValidEmail: (email) => email.includes('@')
   * });
   *
   * customEnforce('notAnEmail') // throws an error
   */
  extend<T extends { [key: string]: (value: any, ...args: any[]) => boolean }>(
    obj: T
  ): (value: any) => IEnforceRules<T> & EnforceExtendMap<T>;
}

declare module 'vest' {
  interface VestTest {
    failed: boolean;
    fieldName: string;
    id: string;
    isWarning: boolean;
    statement: string;
    suiteId: string;
    testFn: TestCB;
    asyncTest?: Promise<string | void>;
  }

  interface ISkip {
    /**
     * Skips provided field from current run.
     * When undefined, the expression is ignored.
     * @param [fieldName] Field name or a list of fields to exclude
     *
     * @example
     *
     * vest.skip('username');
     * vest.skip(['username', 'password']);
     */
    (fieldName?: ExclusionArg): void;
    /**
     * Skips provided group from current run.
     * When undefined, the expression is ignored.
     * @param [groupName] group name or a list of groups to exclude.
     *
     * @example
     *
     * vest.skip.group('username');
     * vest.skip.group(['username', 'password']);
     */
    group(groupName?: ExclusionArg): void;
  }

  interface IOnly {
    /**
     * Singles out a field name to be tested.
     * When fieldName is undefined, the expression is ignored.
     * @param [fieldName] Field name or a list of fields to include
     *
     * @example
     *
     * vest.only('username');
     * vest.only(['username', 'password']);
     */
    (fieldName?: ExclusionArg): void;
    /**
     * Singles out a group name to be tested.
     * When groupName is undefined, the expression is ignored.
     * @param [groupName] Field name or a list of groups to include.
     *
     * @example
     *
     * vest.only.group('username');
     * vest.only.group(['username', 'password']);
     */
    group(groupName?: ExclusionArg): void;
  }

  interface ITest {
    /**
     * Runs a single test
     * @param fieldName The name of the field being validated
     * @param message   Descriptive message to display on failure
     * @param testFn    Test body
     *
     * @example
     *
     * test('username', 'Username is required', () => {
     *  enforce(username).isNotEmpty();
     * });
     */
    (fieldName: string, message: string, testFn: TestCB): VestTest;
    /**
     * Runs a single test
     * @param fieldName The name of the field being validated
     * @param testFn    Test body
     *
     * @example
     *
     * test('username', () => {
     *  enforce(username).isNotEmpty();
     * });
     */
    (fieldName: string, testFn: TestCB): VestTest;

    /**
     * Runs a single test. Memoizes the result based on the dependency array.
     * @param fieldName     The name of the field being validated
     * @param message       Descriptive message to display on failure
     * @param testFn        Test body
     * @param dependencies  An array of values to be checked for strict equality ('===')
     *
     * @example
     *
     * test.memo('username', 'Username already exists', () => doesUserExist(username), [username])
     */
    memo(
      fieldName: string,
      message: string,
      testFn: TestCB,
      dependencies: any[]
    ): VestTest;
    /**
     * Runs a single test. Memoizes the result based on the dependency array.
     * @param fieldName     The name of the field being validated
     * @param testFn        Test body
     * @param dependencies  An array of values to be checked for strict equality ('===')
     *
     * @example
     *
     * test.memo('username', () => doesUserExist(username), [username])
     */
    memo(fieldName: string, testFn: TestCB, dependencies: any[]): VestTest;
  }

  interface ICreateResult {
    (...args: any[]): IVestResult;
    get: () => ReturnType<Vest['get']>;
    reset: () => ReturnType<Vest['reset']>;
  }

  interface Vest {
    test: ITest;
    enforce: IEnforce;
    only: IOnly;
    skip: ISkip;

    /**
     * Retrieves current validation state.
     * @param suiteName Suite name.
     *
     * @example
     *
     * vest.get('user_form');
     *
     */
    get: (suiteName: string) => DraftResult;

    /**
     * Resets suite state to its initial - unvalidated state.
     * @param suiteName Suite name.
     *
     * @example
     *
     * vest.reset('user_form');
     *
     */
    reset: (suiteName: string) => void;

    /**
     * Runs a stateless validation suite.
     * @param suiteName Unique suite name.
     * @param tests     Suite body.
     *
     * @example
     *
     * const res = validate('form_name', () => {
     *  // your tests go here
     * });
     */
    validate(suiteName: string, tests: () => void): IVestResult;

    /**
     * Runs a stateful validation suite.
     * @param suiteName Unique suite name.
     * @param tests     Suite body.
     *
     * @example
     *
     * const validate = vest.create('form_name', (data = {}) => {
     *    // your tests go here
     * });
     *
     * const res = validate({username: 'example'});
     */
    create(suiteName: string, tests: (...args: any[]) => void): ICreateResult;

    /**
     * Allows grouping tests so you can handle them together
     * @param groupName Group name.
     * @param testFn    Group body.
     *
     * @example
     *
     * group('sign_up', () => {
     *  // your tests go here
     * });
     */
    group(groupName: string, testFn: () => void): void;

    /**
     * Marks a test as warning.
     * Needs to run within a test body.
     *
     * @example
     *
     * test('password', 'Consider using a longer password.', () => {
     *  vest.warn();
     *
     *  enforce(password).longerThan(10);
     * });
     */
    warn(): void;

    /**
     * Retrieves an intermediate validation result during the validation runtime.
     */
    draft(): DraftResult;
    VERSION: string;
  }

  const {
    test,
    validate,
    create,
    warn,
    draft,
    VERSION,
    enforce,
    skip,
    only,
    group,
    reset,
    get,
  }: Vest;

  export {
    test,
    validate,
    create,
    warn,
    draft,
    VERSION,
    enforce,
    skip,
    only,
    group,
    reset,
    get,
  };

  const vest: Vest;

  export default vest;
}
