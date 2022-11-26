export type TestFn = () => TestResult;
export type AsyncTest = Promise<string | void | false>;
export type TestResult = AsyncTest | boolean | void;
