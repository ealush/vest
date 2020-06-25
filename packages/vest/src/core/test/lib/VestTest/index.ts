import id from '../../../../lib/id';

type ConstructorArgs = {
  suiteId: string;
  fieldName: string;
  statement?: string;
  testFn: () => any;
  group?: string;
};

class VestTest {
  id: number;
  groupName?: string;
  failed: boolean;
  fieldName: string;
  isWarning: boolean;
  statement?: string;
  suiteId: string;
  testFn: Function | Promise<any>;
  asyncTest: Promise<any>;

  constructor({
    suiteId,
    fieldName,
    statement,
    testFn,
    group,
  }: ConstructorArgs) {
    Object.assign(this, {
      failed: false,
      fieldName,
      id: id(),
      isWarning: false,
      statement,
      suiteId,
      testFn,
    });

    if (group) {
      this.groupName = group;
    }
  }

  /**
   * Current validity status of a test.
   */
  valueOf() {
    return this.failed !== true;
  }

  fail() {
    this.failed = true;
    return this;
  }

  warn() {
    this.isWarning = true;
    return this;
  }
}

export default VestTest;
export type VestTestType = VestTest;
