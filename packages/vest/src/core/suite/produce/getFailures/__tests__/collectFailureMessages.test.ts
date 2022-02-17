import { Severity } from 'Severity';
import VestTest from 'VestTest';
import collectFailureMessages from 'collectFailureMessages';

describe('collectFailureMessages', () => {
  let testObjects: VestTest[] = [];

  it('Should return an object containing just the requested field', () => {
    const result = collectFailureMessages(Severity.ERRORS, testObjects, {
      fieldName: 'field_1',
    });
    expect(Object.keys(result)).toEqual(['field_1']);
  });

  test('Result has an array of matching error messages', () => {
    const result = collectFailureMessages(Severity.ERRORS, testObjects, {
      fieldName: 'field_1',
    });
    expect(result.field_1).toEqual([
      'field_1_failure message 2',
      'field_1_failure message 3',
    ]);
  });

  it('Should return filtered messages by the selected group', () => {
    const result = collectFailureMessages(Severity.ERRORS, testObjects, {
      group: 'group1',
    });

    expect(result).toEqual({ field_2: ['field_2_failure message 3'] });
  });

  it('Should return an empty object when no options and no failures', () => {
    expect(
      collectFailureMessages(Severity.ERRORS, [
        new VestTest('field_1', jest.fn(), { message: 'error_message' }),
      ])
    ).toEqual({});
  });

  it('Should return an object with an empty array when selected field has no errors', () => {
    expect(
      collectFailureMessages(
        Severity.ERRORS,
        [new VestTest('field_1', jest.fn(), { message: 'error_message' })],
        { fieldName: 'field_1' }
      )
    ).toEqual({ field_1: [] });
  });

  [Severity.ERRORS, Severity.WARNINGS].forEach((severity: Severity) => {
    describe('Snapshot tests. severity: ' + severity, () => {
      describe('When no options passed', () => {
        it('should match snapshot', () => {
          expect(
            collectFailureMessages(severity, testObjects)
          ).toMatchSnapshot();
        });
      });

      describe('When specific field requested', () => {
        it('Should match snapshot', () => {
          expect(
            collectFailureMessages(severity, testObjects, {
              fieldName: 'field_1',
            })
          ).toMatchSnapshot();
          expect(
            collectFailureMessages(severity, testObjects, {
              fieldName: 'field_2',
            })
          ).toMatchSnapshot();
          expect(
            collectFailureMessages(severity, testObjects, {
              fieldName: 'field_3',
            })
          ).toMatchSnapshot();
        });
      });

      describe('When specific group requested', () => {
        it('Should match snapshot', () => {
          expect(
            collectFailureMessages(severity, testObjects, {
              group: 'group1',
            })
          ).toMatchSnapshot();
          expect(
            collectFailureMessages(severity, testObjects, {
              group: 'group1',
            })
          ).toMatchSnapshot();
          expect(
            collectFailureMessages(severity, testObjects, {
              group: 'group1',
            })
          ).toMatchSnapshot();
        });
      });

      describe('When a group-fieldName combo is requested', () => {
        it('Should match snapshot', () => {
          expect(
            collectFailureMessages(severity, testObjects, {
              group: 'group1',
              fieldName: 'field_2',
            })
          ).toMatchSnapshot();
        });
      });
    });
  });

  beforeEach(() => {
    testObjects = [
      new VestTest('field_1', jest.fn(), {
        message: 'field_1_failure message 1',
      }),
      (() => {
        const test = new VestTest('field_1', jest.fn(), {
          message: 'field_1_failure message 2',
        });
        test.fail();
        return test;
      })(),
      (() => {
        const test = new VestTest('field_1', jest.fn(), {
          message: 'field_1_failure message 3',
        });
        test.fail();
        return test;
      })(),
      new VestTest('field_1', jest.fn(), { groupName: 'group1' }),
      new VestTest('field_2', jest.fn(), {
        groupName: 'group1',
        message: 'field_2_failure message 1',
      }),
      (() => {
        const test = new VestTest('field_2', jest.fn(), {
          message: 'field_2_warning message 1',
        });
        test.warn();
        return test;
      })(),
      (() => {
        const test = new VestTest('field_2', jest.fn(), {
          message: 'field_2_warning message 2',
        });
        test.fail();
        test.warn();
        return test;
      })(),
      (() => {
        const test = new VestTest('field_2', jest.fn(), {
          groupName: 'group1',
          message: 'field_2_warning message 3',
        });
        test.fail();
        test.warn();
        return test;
      })(),
      (() => {
        const test = new VestTest('field_2', jest.fn(), {
          groupName: 'group1',
          message: 'field_2_failure message 3',
        });
        test.fail();
        return test;
      })(),
      new VestTest('field_3', jest.fn()),
    ];
  });
});
