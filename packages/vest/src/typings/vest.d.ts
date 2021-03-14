import { TEnforce } from './enforce';
import { IVestResult, DraftResult } from './vestResult';

type TestCB = () => void | Promise<void | string> | false;
type TestArgsCB = (...args: any[]) => void | Promise<void | string> | false;
type MessageFunc = (...args: any[]) => string;
type ExclusionArg = string | string[] | void;

export = vest;
export as namespace vest;

interface VestTest {
  failed: boolean;
  fieldName: string;
  id: string;
  isWarning: boolean;
  statement: string;
  testFn: TestCB;
  asyncTest?: Promise<void | string>;
}

interface ITestEach {
  /**
   * Run multiple tests using a parameter table
   * @param {String} fieldName          Name of the field to test.
   * @param {String|function} message   The message returned in case of a failure.  Follows printf syntax.
   * @param {function} testFn           The actual test callback.
   *
   * @example
   *
   * test.each([[1,2,3],[2,1,3]])('test', (a, b, c) => `${a} + ${b} does not equal ${c}`, (a, b, c) => enforce(a + b).equals(c));
   */
  (
    fieldName: string | MessageFunc,
    message: string | MessageFunc,
    testFn: TestArgsCB
  ): VestTest[];
  /**
   * Run multiple tests using a parameter table
   * @param {String} fieldName    Name of the field to test.
   * @param {function} testFn     The actual test callback.
   *
   * @example
   *
   * test.each([[1,2,3],[2,1,3]])('test', (a, b, c) => enforce(a + b).equals(c));
   */
  (fieldName: string | MessageFunc, testFn: TestArgsCB): VestTest[];
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
  /**
   * Create test.each with table of parameters
   * @param {any[]} table               Array of arrays with params for each run, although it
   *                                      will accept 1d-array and treat every item as size one array (e.g. [1,2,3] -> [[1],[2],[3]])
   * @example
   *
   * test.each([[1,2,3],[2,1,3]])('test', 'failed', (a, b, c) => enforce(a + b).equals(c));
   */
  each(table: any[]): ITestEach;
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
   * @param [groupName] group name or a list of group to exclude
   *
   * @example
   *
   * vest.skip.group('section_1');
   * vest.skip.group(['section_1', 'section_2']);
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
   * vest.only.group('section_1');
   * vest.only.group(['section_1', 'section_2']);
   */
  group(groupName?: ExclusionArg): void;
}

interface ISubscribePayload {
  type: string;
  suiteState: Record<string, any>;
  key?: string;
  value?: any;
}

interface ICreateResult {
  (...args: any[]): IVestResult;
  get: () => DraftResult;
  reset: () => void;
  remove: (fieldName: string) => void;

  subscribe: (payload: ISubscribePayload) => void;
}

declare namespace vest {
  const enforce: TEnforce;
  const test: ITest;
  const only: IOnly;
  const skip: ISkip;

  /**
   * Runs a stateful validation suite.
   * @param [suiteName] Unique suite name.
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
  function create(
    suiteName: string,
    tests: (...args: any[]) => void
  ): ICreateResult;

  /**
   * Runs a stateful validation suite.
   * @param tests     Suite body.
   *
   * @example
   *
   * const validate = vest.create((data = {}) => {
   *    // your tests go here
   * });
   *
   * const res = validate({username: 'example'});
   */
  function create(tests: (...args: any[]) => void): ICreateResult;
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
  function group(groupName: string, testFn: () => void): void;

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
  function warn(): void;

  const VERSION: string;
}
