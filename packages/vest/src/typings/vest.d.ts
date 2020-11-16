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
  [K in keyof T]: (...args: any[]) => RuleReturn<T>;
};

type RuleReturn<T> = IEnforceRules<T> & EnforceExtendMap<T>;

type TNumeral = number | string;
type RuleNumeral<T> = (expected: TNumeral) => RuleReturn<T>;
type RuleRange<T> = (start: TNumeral, end: TNumeral) => RuleReturn<T>;
type RuleNoExpectedValue<T> = () => RuleReturn<T>;
type RuleString<T> = (str: string) => RuleReturn<T>;
type RuleMatches<T> = (expected: string | RegExp) => RuleReturn<T>;
type RuleAny<T> = (expected: any) => RuleReturn<T>;
type RuleInside<T> = (
  expected: Array<string | number | boolean> | string
) => RuleReturn<T>;
export interface IEnforceRules<T = {}> {
  equals: RuleAny<T>;
  notEquals: RuleAny<T>;
  numberEquals: RuleNumeral<T>;
  greaterThan: RuleNumeral<T>;
  greaterThanOrEquals: RuleNumeral<T>;
  lessThan: RuleNumeral<T>;
  lessThanOrEquals: RuleNumeral<T>;
  longerThan: RuleNumeral<T>;
  longerThanOrEquals: RuleNumeral<T>;
  shorterThan: RuleNumeral<T>;
  shorterThanOrEquals: RuleNumeral<T>;
  gt: RuleNumeral<T>;
  gte: RuleNumeral<T>;
  lt: RuleNumeral<T>;
  lte: RuleNumeral<T>;
  isBetween: RuleRange<T>;
  endsWith: RuleString<T>;
  startsWith: RuleString<T>;
  doesNotEndWith: RuleString<T>;
  doesNotStartWith: RuleString<T>;
  numberNotEquals: RuleNumeral<T>;
  matches: RuleMatches<T>;
  notMatches: RuleMatches<T>;
  isUndefined: RuleNoExpectedValue<T>;
  isArray: RuleNoExpectedValue<T>;
  isEmpty: RuleNoExpectedValue<T>;
  isEven: RuleNoExpectedValue<T>;
  isBoolean: RuleNoExpectedValue<T>;
  isNotBoolean: RuleNoExpectedValue<T>;
  isNumber: RuleNoExpectedValue<T>;
  isNaN: RuleNoExpectedValue<T>;
  isNotNaN: RuleNoExpectedValue<T>;
  isNumeric: RuleNoExpectedValue<T>;
  isOdd: RuleNoExpectedValue<T>;
  isTruthy: RuleNoExpectedValue<T>;
  isFalsy: RuleNoExpectedValue<T>;
  isString: RuleNoExpectedValue<T>;
  isNotArray: RuleNoExpectedValue<T>;
  isNotEmpty: RuleNoExpectedValue<T>;
  isNotNumber: RuleNoExpectedValue<T>;
  isNotNumeric: RuleNoExpectedValue<T>;
  isNotBetween: RuleRange<T>;
  isNotString: RuleNoExpectedValue<T>;
  inside: RuleInside<T>;
  notInside: RuleInside<T>;
  lengthEquals: RuleNumeral<T>;
  lengthNotEquals: RuleNumeral<T>;
  isNegative: RuleNumeral<T>;
  isPositive: RuleNumeral<T>;
  loose: <T>(shape: {
    [key: string]: TEnforceLazy | TEnforceLazy[];
  }) => RuleReturn<T>;
  shape: <T>(shape: {
    [key: string]: TEnforceLazy | TEnforceLazy[];
  }, options?: {
    loose?: boolean
  }) => RuleReturn<T>;
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

type LazyNumeral = (expected: TNumeral) => TEnforceLazy;
type LazyEnforceWithNoArgs = () => TEnforceLazy;
type LazyString = (str: string) => TEnforceLazy;
type LazyRange = (start: number, end: number) => TEnforceLazy;
type LazyMatches = (expected: string | RegExp) => TEnforceLazy;
type LazyAny = (expected: any) => TEnforceLazy;
type LazyInside = (
  expected: Array<string | number | boolean> | string
) => TEnforceLazy;

type TEnforceLazy = {
  [key: string]: (...args: any[]) => TEnforceLazy | boolean;
  test: (...args: any[]) => boolean;
  equals: LazyAny;
  notEquals: LazyAny;
  numberEquals: LazyNumeral;
  greaterThan: LazyNumeral;
  greaterThanOrEquals: LazyNumeral;
  lessThan: LazyNumeral;
  lessThanOrEquals: LazyNumeral;
  longerThan: LazyNumeral;
  longerThanOrEquals: LazyNumeral;
  shorterThan: LazyNumeral;
  shorterThanOrEquals: LazyNumeral;
  gt: LazyNumeral;
  gte: LazyNumeral;
  lt: LazyNumeral;
  lte: LazyNumeral;
  isBetween: LazyRange;
  endsWith: LazyString;
  startsWith: LazyString;
  doesNotEndWith: LazyString;
  doesNotStartWith: LazyString;
  numberNotEquals: LazyNumeral;
  matches: LazyMatches;
  notMatches: LazyMatches;
  isUndefined: LazyEnforceWithNoArgs;
  isArray: LazyEnforceWithNoArgs;
  isEmpty: LazyEnforceWithNoArgs;
  isEven: LazyEnforceWithNoArgs;
  isNumber: LazyEnforceWithNoArgs;
  isNaN: LazyEnforceWithNoArgs;
  isNotNaN: LazyEnforceWithNoArgs;
  isNumeric: LazyEnforceWithNoArgs;
  isOdd: LazyEnforceWithNoArgs;
  isTruthy: LazyEnforceWithNoArgs;
  isFalsy: LazyEnforceWithNoArgs;
  isString: LazyEnforceWithNoArgs;
  isNotArray: LazyEnforceWithNoArgs;
  isNotEmpty: LazyEnforceWithNoArgs;
  isNotNumber: LazyEnforceWithNoArgs;
  isNotNumeric: LazyEnforceWithNoArgs;
  isNotBetween: LazyRange;
  isNotString: LazyEnforceWithNoArgs;
  inside: LazyInside;
  notInside: LazyInside;
  lengthEquals: LazyNumeral;
  lengthNotEquals: LazyNumeral;
  isNegative: LazyEnforceWithNoArgs;
  isPositive: LazyEnforceWithNoArgs;
  isBoolean: LazyEnforceWithNoArgs;
  isNotBoolean: LazyEnforceWithNoArgs;
  loose: <T>(shape: {
    [key: string]: TEnforceLazy | TEnforceLazy[];
  }) => TEnforceLazy;
  shape: <T>(shape: {
    [key: string]: TEnforceLazy | TEnforceLazy[];
  }, options?: {
    loose?: boolean
  }) => TEnforceLazy;
  optional: <T>(...rules: TEnforceLazy[]) => TEnforceLazy;
  isArrayOf: <T>(...rules: TEnforceLazy[]) => TEnforceLazy;
};

declare module 'vest' {
  interface VestTest {
    failed: boolean;
    fieldName: string;
    id: string;
    isWarning: boolean;
    statement: string;
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
    get: () => DraftResult;
    reset: () => void;
  }

  interface Vest {
    test: ITest;
    enforce: IEnforce & TEnforceLazy;
    only: IOnly;
    skip: ISkip;

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

    VERSION: string;
  }

  const { test, create, warn, VERSION, enforce, skip, only, group }: Vest;

  export { test, create, warn, VERSION, enforce, skip, only, group };

  const vest: Vest;

  export default vest;
}
