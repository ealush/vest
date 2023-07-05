import { faker } from '@faker-js/faker';
import { ErrorStrings } from 'ErrorStrings';

import { dummyTest } from '../../../../testUtils/testDummy';

import { skip, only } from 'focused';
import { group } from 'group';
import { TTestSuite } from 'testUtils/TVestMock';
import { useIsExcluded } from 'useIsExcluded';
import * as vest from 'vest';

let res: boolean, res1: boolean;

enum FieldNames {
  f1 = 'f1',
  f2 = 'f2',
  f3 = 'f3',
}

describe('focused hooks', () => {
  test('isExcluded should respect group exclusion', () => {
    let testObject: vest.IsolateTest;
    let testObject1: vest.IsolateTest;

    const validate = vest.create(() => {
      testObject = dummyTest.failing();

      group('group_1', () => {
        vest.skip(true);
        testObject1 = dummyTest.failing();
      });

      res = useIsExcluded(testObject);
      res1 = useIsExcluded(testObject1);
    });

    validate();

    expect(res).toBe(false);
    expect(res1).toBe(true);
  });

  describe('`only` hook', () => {
    describe('string input', () => {
      test('isExcluded returns false for included field', () => {
        vest.create(() => {
          vest.only(FieldNames.f1);
          const test = dummyTest.failing(FieldNames.f1);
          res = useIsExcluded(test);
        })();
        expect(res).toBe(false);
      });

      test('isGroupExcluded returns false for included groups', () => {
        vest.create(() => {
          vest.only('group_name');

          group('group_name', () => {
            res = useIsGroupExcluded('group_name');
          });
        })();
        expect(res).toBe(false);
      });

      test('isExcluded returns true for non included field', () => {
        vest.create(() => {
          vest.only(FieldNames.f1);
          const t1 = dummyTest.failing(FieldNames.f1);
          const t2 = dummyTest.failing(FieldNames.f2);
          res1 = useIsExcluded(t1);
          res = useIsExcluded(t2);
        })();
        expect(res1).toBe(false);
        expect(res).toBe(true);
      });

      test('isGroupExcluded returns true for non included group', () => {
        vest.create(() => {
          vest.only.group('group_1');

          group('group_1', jest.fn());
          group('group_2', jest.fn());

          res1 = useIsGroupExcluded('group_1');
          res = useIsGroupExcluded('group_2');
        })();

        expect(res1).toBe(false);
        expect(res).toBe(true);
      });
    });

    describe('array input', () => {
      test('isExcluded returns false for included field', () => {
        vest.create(() => {
          vest.only([FieldNames.f1, FieldNames.f2]);
          const test1 = dummyTest.failing(FieldNames.f1);
          const test2 = dummyTest.failing(FieldNames.f2);
          res = useIsExcluded(test1);
          res1 = useIsExcluded(test2);
        })();
        expect(res).toBe(false);
        expect(res1).toBe(false);
      });

      test('isGroupExcluded returns false for included groups', () => {
        const results: boolean[] = [];
        vest.create(() => {
          vest.only.group(['group_1', 'group_2']);

          group('group_1', jest.fn());
          group('group_2', jest.fn());
          group('group_3', jest.fn());

          results.push(
            useIsGroupExcluded('group_1'),
            useIsGroupExcluded('group_2'),
            useIsGroupExcluded('group_3')
          );
        })();
        expect(results).toEqual([false, false, true]);
      });

      test('isExcluded returns true for non included field', () => {
        const results: boolean[] = [];
        const results1: boolean[] = [];
        vest.create(() => {
          const test1 = dummyTest.failing(FieldNames.f1);
          const test2 = dummyTest.failing(FieldNames.f2);
          const test3 = dummyTest.failing(FieldNames.f3);
          results.push(
            useIsExcluded(test1),
            useIsExcluded(test2),
            useIsExcluded(test3)
          );
          vest.only([FieldNames.f1, test2.fieldName]);
          results1.push(
            useIsExcluded(test1),
            useIsExcluded(test2),
            useIsExcluded(test3)
          );
        })();
        expect(results).toEqual([false, false, false]);
        expect(results1).toEqual([false, false, true]);
      });

      test('isGroupExcluded returns true for non included groups', () => {
        const results: boolean[] = [];
        vest.create(() => {
          vest.only.group(['group_1', 'group_2']);

          group('group_3', jest.fn());
          results.push(
            useIsGroupExcluded('group_1'),
            useIsGroupExcluded('group_2'),
            useIsGroupExcluded('group_3')
          );
        })();
        expect(results).toEqual([false, false, true]);
      });
    });
  });

  describe('`skip` hook', () => {
    describe('string input', () => {
      test('isExcluded returns true for excluded field', () => {
        vest.create(() => {
          vest.skip(FieldNames.f1);
          const test1 = dummyTest.failing(FieldNames.f1);
          res = useIsExcluded(test1);
        })();
        expect(res).toBe(true);
      });

      test('isGroupExcluded returns true for excluded groups', () => {
        vest.create(() => {
          vest.skip.group('group_1');
          res = useIsGroupExcluded('group_1');
          res1 = useIsGroupExcluded('group_2');
        })();

        expect(res).toBe(true);
        expect(res1).toBe(false);
      });

      test('isExcluded returns false for non excluded field', () => {
        vest.create(() => {
          vest.skip(FieldNames.f1);
          res = useIsExcluded(vest.test(FieldNames.f2, jest.fn()));
        })();
        expect(res).toBe(false);
      });
    });

    test('isGroupExcluded returns false for tests in non excluded groups', () => {
      vest.create(() => {
        vest.skip('group_1');
        res = useIsExcluded(vest.test('field_1', jest.fn()));
      })();
      expect(res).toBe(false);
    });

    describe('array input', () => {
      test('isExcluded returns true for excluded field', () => {
        vest.create(() => {
          vest.skip([FieldNames.f1, FieldNames.f2]);
          const test1 = dummyTest.failing(FieldNames.f1);
          const test2 = dummyTest.failing(FieldNames.f2);
          res = useIsExcluded(test1);
          res1 = useIsExcluded(test2);
        })();
        expect(res).toBe(true);
        expect(res1).toBe(true);
      });

      test('isGroupExcluded returns true for excluded groups', () => {
        const results: boolean[] = [];
        vest.create(() => {
          vest.skip.group(['group_1', 'group_2']);
          results.push(
            useIsGroupExcluded('group_1'),
            useIsGroupExcluded('group_2')
          );
        })();
        expect(results).toEqual([true, true]);
      });

      test('isExcluded returns false for non included field', () => {
        vest.create(() => {
          vest.skip([FieldNames.f1, FieldNames.f2]);
          const test3 = dummyTest.failing(FieldNames.f3);
          res = useIsExcluded(test3);
        })();
        expect(res).toBe(false);
      });

      test('isGroupExcluded returns false for non excluded groups', () => {
        vest.create(() => {
          vest.skip(['group_1', 'group_2']);
          res = useIsGroupExcluded('group_3');
        })();
        expect(res).toBe(false);
      });
    });

    describe('Field is in a non included group', () => {
      let suite: TTestSuite;

      beforeEach(() => {
        suite = vest.create(() => {
          vest.only.group('group_1');

          vest.group('group_1', () => {
            vest.test('field_1', jest.fn());
          });
          vest.group('group_2', () => {
            vest.test('field_2', jest.fn());
          });
        });
        suite();
      });

      it('Should exclude test', () => {
        expect(suite.get().tests.field_2.testCount).toBe(0);
      });
    });
  });

  describe('Error handling', () => {
    describe('When called outside of a suite', () => {
      it('Should throw an error', () => {
        expect(() => only(faker.random.word())).toThrow(
          ErrorStrings.HOOK_CALLED_OUTSIDE
        );
        expect(() => skip(faker.random.word())).toThrow(
          ErrorStrings.HOOK_CALLED_OUTSIDE
        );
      });
    });
  });
});

// FIXME: These are lower quality tests, and we need to replace them with more robust ones
// describe('isExcluded', () => {
//   let exclusion: Partial<TExclusion>;

//   const runIsExcluded = (
//     exclusion: Partial<TExclusion>,
//     testObject: IsolateTest
//   ) => {
//     vest.staticSuite(() => {

//     })
//     // SuiteContext.run({}, () => {
//     //   Object.assign(useExclusion(), exclusion);
//     //   const res = useIsExcluded(testObject);

//     //   return res;
//     // });
//   }

//   const genTest = (fieldName: string, groupName?: string) =>
//     new IsolateTest({
//       fieldName,
//       testFn: jest.fn(),
//       groupName,
//     });
//   describe('skip', () => {
//     beforeEach(() => {
//       exclusion = { tests: { field_1: false, field_2: false } };
//     });
//     it('returns true for skipped field', () => {
//       expect(runIsExcluded(exclusion, genTest('field_1'))).toBe(true);
//       expect(runIsExcluded(exclusion, genTest('field_2', 'group_1'))).toBe(
//         true
//       );
//     });
//     it('returns false for non skipped field', () => {
//       expect(runIsExcluded(exclusion, genTest('field_3'))).toBe(false);
//       expect(runIsExcluded(exclusion, genTest('field_4', 'group_1'))).toBe(
//         false
//       );
//     });
//   });
//   describe('only', () => {
//     beforeEach(() => {
//       exclusion = { tests: { field_1: true, field_2: true } };
//     });
//     it('returns false for included field', () => {
//       expect(runIsExcluded(exclusion, genTest('field_1'))).toBe(false);
//       expect(runIsExcluded(exclusion, genTest('field_2', 'group_1'))).toBe(
//         false
//       );
//     });
//     it('returns true for non included field', () => {
//       expect(runIsExcluded(exclusion, genTest('field_3'))).toBe(true);
//       expect(runIsExcluded(exclusion, genTest('field_4', 'group_1'))).toBe(
//         true
//       );
//     });
//   });
//   describe('only+skip', () => {
//     beforeEach(() => {
//       exclusion = {
//         tests: { field_1: true, field_2: true, field_3: false, field_4: false },
//       };
//     });
//     it('returns false for included tests', () => {
//       expect(runIsExcluded(exclusion, genTest('field_1'))).toBe(false);
//       expect(runIsExcluded(exclusion, genTest('field_2', 'group_1'))).toBe(
//         false
//       );
//     });
//     it('returns true excluded tests', () => {
//       expect(runIsExcluded(exclusion, genTest('field_3'))).toBe(true);
//       expect(runIsExcluded(exclusion, genTest('field_4', 'group_1'))).toBe(
//         true
//       );
//     });
//     it('returns true for non included field', () => {
//       expect(runIsExcluded(exclusion, genTest('field_5'))).toBe(true);
//       expect(runIsExcluded(exclusion, genTest('field_6', 'group_1'))).toBe(
//         true
//       );
//     });
//   });
//   describe('skip.group', () => {
//     beforeEach(() => {
//       exclusion = {
//         groups: {
//           group_1: false,
//           group_2: false,
//         },
//       };
//     });

//     it('Returns true for tests in skipped group', () => {
//       expect(runIsExcluded(exclusion, genTest('field_1', 'group_1'))).toBe(
//         true
//       );
//       expect(runIsExcluded(exclusion, genTest('field_2', 'group_2'))).toBe(
//         true
//       );
//     });
//     it('Returns false for tests in non skipped groups', () => {
//       expect(runIsExcluded(exclusion, genTest('field_3', 'group_3'))).toBe(
//         false
//       );
//       expect(runIsExcluded(exclusion, genTest('field_4', 'group_4'))).toBe(
//         false
//       );
//     });
//     it('Returns false for tests outside of any group', () => {
//       expect(runIsExcluded(exclusion, genTest('field_3'))).toBe(false);
//       expect(runIsExcluded(exclusion, genTest('field_4'))).toBe(false);
//     });
//   });
//   describe('only.group', () => {
//     beforeEach(() => {
//       exclusion = {
//         groups: {
//           group_1: true,
//           group_2: true,
//         },
//       };
//     });

//     it('returns false for tests in included groups', () => {
//       expect(runIsExcluded(exclusion, genTest('field_1', 'group_1'))).toBe(
//         false
//       );
//       expect(runIsExcluded(exclusion, genTest('field_1', 'group_2'))).toBe(
//         false
//       );
//     });

//     it('returns true for groups in non included groups', () => {
//       expect(runIsExcluded(exclusion, genTest('field_1', 'group_3'))).toBe(
//         true
//       );
//       expect(runIsExcluded(exclusion, genTest('field_2', 'group_4'))).toBe(
//         true
//       );
//     });

//     it('returns true for tests outside of any group', () => {
//       expect(runIsExcluded(exclusion, genTest('field_1'))).toBe(true);
//       expect(runIsExcluded(exclusion, genTest('field_2'))).toBe(true);
//     });
//   });

//   describe('only.group + only', () => {
//     beforeEach(() => {
//       exclusion = {
//         groups: {
//           group_1: true,
//           group_2: true,
//         },
//         tests: { field_1: true, field_2: true },
//       };
//     });

//     it('returns true for included tests outside of the group', () => {
//       expect(runIsExcluded(exclusion, genTest('field_1'))).toBe(true);
//       expect(runIsExcluded(exclusion, genTest('field_2'))).toBe(true);
//     });

//     it('returns false for included tests in included groups', () => {
//       expect(runIsExcluded(exclusion, genTest('field_1', 'group_1'))).toBe(
//         false
//       );
//       expect(runIsExcluded(exclusion, genTest('field_2', 'group_2'))).toBe(
//         false
//       );
//     });

//     it('returns true for included test in non included group', () => {
//       expect(runIsExcluded(exclusion, genTest('field_1', 'group_3'))).toBe(
//         true
//       );
//       expect(runIsExcluded(exclusion, genTest('field_2', 'group_4'))).toBe(
//         true
//       );
//     });

//     it('returns true for non included test in included group', () => {
//       expect(runIsExcluded(exclusion, genTest('field_3', 'group_1'))).toBe(
//         true
//       );
//       expect(runIsExcluded(exclusion, genTest('field_4', 'group_2'))).toBe(
//         true
//       );
//     });

//     it('returns true for non included tests', () => {
//       expect(runIsExcluded(exclusion, genTest('field_3'))).toBe(true);
//       expect(runIsExcluded(exclusion, genTest('field_4'))).toBe(true);
//     });
//   });

//   describe('skip.group + only', () => {
//     beforeEach(() => {
//       exclusion = {
//         groups: {
//           group_1: false,
//           group_2: false,
//         },
//         tests: { field_1: true, field_2: true },
//       };
//     });

//     it('returns true for included tests in excluded groups', () => {
//       expect(runIsExcluded(exclusion, genTest('field_1', 'group_1'))).toBe(
//         true
//       );
//       expect(runIsExcluded(exclusion, genTest('field_2', 'group_1'))).toBe(
//         true
//       );
//       expect(runIsExcluded(exclusion, genTest('field_3', 'group_1'))).toBe(
//         true
//       );
//       expect(runIsExcluded(exclusion, genTest('field_1', 'group_2'))).toBe(
//         true
//       );
//       expect(runIsExcluded(exclusion, genTest('field_2', 'group_2'))).toBe(
//         true
//       );
//       expect(runIsExcluded(exclusion, genTest('field_3', 'group_2'))).toBe(
//         true
//       );
//     });

//     it('returns false for included tests in non excluded groups', () => {
//       expect(runIsExcluded(exclusion, genTest('field_1', 'group_3'))).toBe(
//         false
//       );
//       expect(runIsExcluded(exclusion, genTest('field_2', 'group_3'))).toBe(
//         false
//       );
//       expect(runIsExcluded(exclusion, genTest('field_1', 'group_4'))).toBe(
//         false
//       );
//       expect(runIsExcluded(exclusion, genTest('field_2', 'group_4'))).toBe(
//         false
//       );
//     });

//     it('returns true for non included tests', () => {
//       expect(runIsExcluded(exclusion, genTest('field_3'))).toBe(true);
//       expect(runIsExcluded(exclusion, genTest('field_4'))).toBe(true);
//     });

//     it('returns false for included tests outside of the group', () => {
//       expect(runIsExcluded(exclusion, genTest('field_1'))).toBe(false);
//       expect(runIsExcluded(exclusion, genTest('field_2'))).toBe(false);
//     });
//   });

//   describe('only.group + skip', () => {
//     beforeEach(() => {
//       exclusion = {
//         groups: {
//           group_1: true,
//           group_2: true,
//         },
//         tests: { field_1: false, field_2: false },
//       };
//     });

//     it('returns true for excluded tests', () => {
//       expect(runIsExcluded(exclusion, genTest('field_1'))).toBe(true);
//       expect(runIsExcluded(exclusion, genTest('field_2'))).toBe(true);
//     });
//     it('returns true for excluded test in included group', () => {
//       expect(runIsExcluded(exclusion, genTest('field_1', 'group_1'))).toBe(
//         true
//       );
//       expect(runIsExcluded(exclusion, genTest('field_2', 'group_2'))).toBe(
//         true
//       );
//     });
//     it('returns true for excluded test in non included group', () => {
//       expect(runIsExcluded(exclusion, genTest('field_1', 'group_3'))).toBe(
//         true
//       );
//       expect(runIsExcluded(exclusion, genTest('field_2', 'group_4'))).toBe(
//         true
//       );
//     });
//     it('returns false for non excluded test in included group', () => {
//       expect(runIsExcluded(exclusion, genTest('field_3', 'group_1'))).toBe(
//         false
//       );
//       expect(runIsExcluded(exclusion, genTest('field_4', 'group_2'))).toBe(
//         false
//       );
//     });
//     it('returns true for non excluded test in non included group', () => {
//       expect(runIsExcluded(exclusion, genTest('field_3', 'group_3'))).toBe(
//         true
//       );
//       expect(runIsExcluded(exclusion, genTest('field_4', 'group_4'))).toBe(
//         true
//       );
//     });
//   });

//   describe('Invalid input', () => {
//     describe('ExclusionItem is not a string', () => {
//       it('Should skip registration', () => {
//         const suite = vest.create('suite', () => {
//           // @ts-ignore - Invalid input
//           vest.only(111);

//           vest.test('f1', () => false);
//         });

//         expect(suite().hasErrors('f1')).toBe(true);
//       });
//     });
//   });
// });
