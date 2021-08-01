import * as vest from 'vest';
import wait from 'wait';

import promisify from 'promisify';
import test from 'test';

const genValidate = tests => vest.create(tests);

describe('test.memo', () => {
  describe('Sync tests', () => {
    const testCb1 = jest.fn();
    const testCb2 = jest.fn();
    const testCb3 = jest.fn();
    const testCb4 = jest.fn();

    const test1Set = new Set();
    const test2Set = new Set();
    const test3Set = new Set();
    const test4Set = new Set();

    const validate = genValidate(value => {
      test1Set.add(
        test.memo(
          'field_1',
          'message',
          () => {
            testCb1();
            return false;
          },
          [value]
        )
      );
      test2Set.add(
        test.memo(
          'field_2',
          'message',
          () => {
            testCb2();
            expect(value).toBe(2);
          },
          [value]
        )
      );
      test3Set.add(
        test.memo(
          'field_3',
          'message',
          () => {
            testCb3();
            expect(value).toBe(1);
          },
          [value]
        )
      );
      test4Set.add(
        test.memo(
          'field_4',
          'message',
          () => {
            testCb4();
            vest.warn();
            expect(value).toBe(2);
          },
          [value]
        )
      );
    });

    let res;

    describe('On cache miss', () => {
      it('Should run all test callbacks normally', () => {
        expect(testCb1).not.toHaveBeenCalled();
        expect(testCb2).not.toHaveBeenCalled();
        expect(testCb3).not.toHaveBeenCalled();
        expect(testCb4).not.toHaveBeenCalled();
        validate(1);
        expect(testCb1).toHaveBeenCalled();
        expect(testCb2).toHaveBeenCalled();
        expect(testCb3).toHaveBeenCalled();
        expect(testCb4).toHaveBeenCalled();
      });

      it('Should produce correct validation result', () => {
        res = validate(1);
        expect(res.hasErrors('field_1')).toBe(true);
        expect(res.hasErrors('field_2')).toBe(true);
        expect(res.hasErrors('field_3')).toBe(false);
        expect(res.hasErrors('field_4')).toBe(false);
        expect(res.hasWarnings('field_4')).toBe(true);
        expect(res).toMatchSnapshot();
      });
    });

    describe('On cache hit', () => {
      it('should return without running cached tests', () => {
        validate(1);
        expect(testCb1).not.toHaveBeenCalled();
        expect(testCb2).not.toHaveBeenCalled();
        expect(testCb3).not.toHaveBeenCalled();
        expect(testCb4).not.toHaveBeenCalled();
      });

      it('Should produce correct validation result', () => {
        const cachedRes = validate(1);
        expect(res.hasErrors('field_1')).toBe(true);
        expect(res.hasErrors('field_2')).toBe(true);
        expect(res.hasErrors('field_3')).toBe(false);
        expect(res.hasErrors('field_4')).toBe(false);
        expect(res.hasWarnings('field_4')).toBe(true);
        expect(cachedRes).toMatchSnapshot();
      });

      it('Returns the same VestTest object', () => {
        validate(1);
        expect(test1Set.size).toBe(1);
        expect(test2Set.size).toBe(1);
        expect(test3Set.size).toBe(1);
        expect(test4Set.size).toBe(1);
      });
    });

    describe('On cache update', () => {
      it('Should call test functions again', () => {
        expect(testCb1).not.toHaveBeenCalled();
        expect(testCb2).not.toHaveBeenCalled();
        expect(testCb3).not.toHaveBeenCalled();
        expect(testCb4).not.toHaveBeenCalled();
        validate(2);
        expect(testCb1).toHaveBeenCalled();
        expect(testCb2).toHaveBeenCalled();
        expect(testCb3).toHaveBeenCalled();
        expect(testCb4).toHaveBeenCalled();
      });

      it('Should produce fresh result', () => {
        const newRes = validate(2);
        expect(newRes).not.isDeepCopyOf(res);
        expect(newRes.hasErrors('field_1')).toBe(true);
        expect(newRes.hasErrors('field_2')).toBe(false);
        expect(newRes.hasErrors('field_3')).toBe(true);
        expect(newRes.hasErrors('field_4')).toBe(false);
        expect(newRes.hasWarnings('field_4')).toBe(false);
        expect(newRes).toMatchSnapshot();
      });

      it('Should return testObject', () => {
        validate(2);
        expect(test1Set.size).toBe(2);
        expect(test2Set.size).toBe(2);
        expect(test3Set.size).toBe(2);
        expect(test4Set.size).toBe(2);
      });
    });
  });

  describe('Async tests', () => {
    describe('Cache miss', () => {
      const testCb1 = jest.fn();

      const validate = genValidate(value => {
        test.memo(
          'field_1',
          () =>
            new Promise<void>((resolve, reject) => {
              testCb1();
              setTimeout(() => {
                if (value === 'FAIL') {
                  reject();
                } else {
                  resolve();
                }
              }, 1000);
            }),
          [value]
        );
      });
      it('Should run test functions normally', () =>
        new Promise<void>(done => {
          const control = jest.fn();
          expect(testCb1).not.toHaveBeenCalled();
          validate('FAIL').done(res => {
            expect(res.hasErrors('field_1')).toBe(true);
            expect(res).toMatchSnapshot();
            control();
          });
          expect(testCb1).toHaveBeenCalledTimes(1);
          setTimeout(() => {
            expect(control).toHaveBeenCalledTimes(1);
            done();
          }, 1000);
        }));
    });

    describe('Cache hit', () => {
      const testCb1 = jest.fn();
      const test1Set = new Set();

      const validate = promisify(
        genValidate(value => {
          test1Set.add(
            test.memo(
              'field_1',
              () =>
                new Promise<void>((resolve, reject) => {
                  testCb1();
                  setTimeout(() => {
                    if (value.startsWith('FAIL')) {
                      reject();
                    } else {
                      resolve();
                    }
                  }, 1000);
                }),
              [value]
            )
          );
        })
      );

      it('Should only call test function once', async () => {
        expect(testCb1).toHaveBeenCalledTimes(0);
        await validate('FAIL');
        expect(testCb1).toHaveBeenCalledTimes(1);
        await validate('FAIL');
        expect(testCb1).toHaveBeenCalledTimes(1);
      });

      it('Should return same test object', async () => {
        await validate('FAIL');
        await validate('FAIL');
        expect(test1Set.size).toBe(1);
      });

      it('Should produce the same result', async () => {
        const res1 = await validate('FAIL');
        const res2 = await validate('FAIL');
        expect(res1).isDeepCopyOf(res2);
      });

      describe('When not fully awaited', () => {
        const testCb1 = jest.fn();
        const test1Set = new Set();

        const validate = genValidate(value => {
          test1Set.add(
            test.memo(
              'field_1',
              () =>
                new Promise<void>((resolve, reject) => {
                  testCb1();
                  setTimeout(() => {
                    if (value.startsWith('FAIL')) {
                      reject();
                    } else {
                      resolve();
                    }
                  }, 1000);
                }),
              [value]
            )
          );
        });
        it('Should only call latest done', async () => {
          const doneCb1 = jest.fn();
          const doneCb2 = jest.fn();
          validate('FAILURE').done(doneCb1);
          await wait(50);
          validate('FAILURE').done(doneCb2);
          await wait(1000);
          expect(doneCb1).not.toHaveBeenCalled();
          expect(doneCb2).toHaveBeenCalled();
        });
      });
    });
  });
});
