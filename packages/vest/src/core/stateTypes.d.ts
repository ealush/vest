type TestDetailsType = {
  [fieldName: string]: {
    testCount: number;
    errorCount: number;
    warnCount: number;
    errors?: string[];
    warnings?: string[];
  };
};

declare interface ISuiteState {
  doneCallbacks: Function[];
  exclusion: {
    tests: { [fieldName: string]: boolean };
    groups: { [groupName: string]: boolean };
  };
  fieldCallbacks: { [field: string]: Function[] };
  groups: {
    [group: string]: TestDetailsType;
  };
  lagging?: VestTestType[];
  name: string;
  pending?: VestTestType[];
  suiteId: string;
  testObjects: VestTestType[];
  tests: TestDetailsType;
}

declare type SuiteStateHistory = ISuiteState[];

declare interface StateKeySuites {
  [suiteId: string]: SuiteStateHistory;
}

declare interface StateInterface {
  _suites: StateKeySuites;
  _canceled: { [key: string]: true };
}
