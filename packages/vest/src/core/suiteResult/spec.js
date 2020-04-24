import faker from "faker";
import { TestObject } from "../test/lib";
import suiteResult from ".";

const formName = "Vest result object";
const fieldName1 = "Sleimr";
const fieldName2 = "Borak";
const statement = "We finally came to an agreement.";

describe("suiteResult module", () => {
  let res;

  beforeEach(() => {
    res = suiteResult(formName);
  });

  test("Initial suite result structure", () => {
    expect(res).toMatchSnapshot();
  });

  test("Marking a test run", () => {
    res.markTestRun(fieldName1);
    expect(res).toMatchSnapshot();
  });

  describe("Marking a field as failed", () => {
    beforeEach(() => {
      res.markTestRun(fieldName1);
    });

    test("When severity is `warning`", () => {
      res.markFailure({
        fieldName: fieldName1,
        statement,
        isWarning: true,
      });
      expect(res).toMatchSnapshot();
    });

    test("When severity is default", () => {
      res.markFailure({
        fieldName: fieldName1,
        statement,
      });
      expect(res).toMatchSnapshot();
    });

    test("When statement is not provided", () => {
      res.markFailure({
        fieldName: fieldName1,
      });
      expect(res).toMatchSnapshot();
    });
  });

  test("Skipping a field", () => {
    res.addToSkipped(fieldName1);
    expect(res).toMatchSnapshot();
  });

  test("Setting a field as pending", () => {
    const testObjects = Array.from(
      { length: 5 },
      () =>
        new TestObject(
          {},
          faker.lorem.word(),
          faker.lorem.sentence(),
          Function.prototype
        )
    );

    testObjects.forEach(res.setPending);

    testObjects.forEach((obj) => {
      expect(res.pending.includes(obj)).toBe(true);
    });
  });

  describe("Output methods", () => {
    let output, statement2;

    beforeEach(() => {
      statement2 = faker.lorem.sentence();
      output = res.output;
      res.markTestRun(fieldName1);
      res.markTestRun(fieldName2);
    });

    describe("hasErrors", () => {
      describe("When no field specified", () => {
        it("Should return current error status for all suite", () => {
          expect(output.hasErrors()).toBe(false);
          res.markFailure({ fieldName: fieldName1 });
          expect(output.hasErrors()).toBe(true);
        });
      });

      describe("When field specified", () => {
        it("Should return error status for a given field", () => {
          expect(output.hasErrors(fieldName2)).toBe(false);
          res.markFailure({ fieldName: fieldName1 });
          expect(output.hasErrors(fieldName1)).toBe(true);
          expect(output.hasErrors(fieldName2)).toBe(false);
        });

        describe("When field doesn't exist", () => {
          it("Should return false", () => {
            expect(output.hasErrors(fieldName2)).toBe(false);
          });
        });
      });
    });

    describe("hasWarnings", () => {
      describe("When no field specified", () => {
        it("Should return current warn status for all suite", () => {
          expect(output.hasWarnings()).toBe(false);
          res.markFailure({ fieldName: fieldName1, isWarning: true });
          expect(output.hasWarnings()).toBe(true);
        });
      });

      describe("When field specified", () => {
        it("Should return warn status for a given field", () => {
          expect(output.hasWarnings(fieldName2)).toBe(false);
          res.markFailure({ fieldName: fieldName1, isWarning: true });
          expect(output.hasWarnings(fieldName1)).toBe(true);
          expect(output.hasWarnings(fieldName2)).toBe(false);
        });

        describe("When field doesn't exist", () => {
          it("Should return false", () => {
            expect(output.hasWarnings("I Do Not Exist")).toBe(false);
          });
        });
      });
    });

    describe("getErrors", () => {
      describe("When no field specified", () => {
        it("Should return error object for whole suite", () => {
          expect(output.getErrors()).toEqual({});
          res.markFailure({ fieldName: fieldName1 });
          res.markFailure({ fieldName: fieldName2, statement });
          res.markFailure({ fieldName: fieldName2, isWarning: true });
          expect(output.getErrors()).toMatchSnapshot();
        });
      });

      describe("When field specified", () => {
        it("Should return error array for a given field", () => {
          expect(output.getErrors()).toEqual({});
          res.markFailure({ fieldName: fieldName1 });
          res.markFailure({ fieldName: fieldName2, statement });
          res.markFailure({ fieldName: fieldName2, isWarning: true });
          expect(output.getErrors(fieldName1)).toEqual([]);
          expect(output.getErrors(fieldName2)).toEqual([statement]);
          res.markFailure({ fieldName: fieldName2, statement: statement2 });
          expect(output.getErrors(fieldName2)).toEqual([statement, statement2]);
        });

        describe("When field doesn't exist", () => {
          it("Should return an empty array", () => {
            expect(output.getErrors("I Do Not Exist")).toEqual([]);
          });
        });
      });
    });

    describe("getWarnings", () => {
      describe("When no field specified", () => {
        it("Should return warning object for whole suite", () => {
          expect(output.getWarnings()).toEqual({});
          res.markFailure({ fieldName: fieldName1, isWarning: true });
          res.markFailure({
            fieldName: fieldName2,
            statement,
            isWarning: true,
          });
          res.markFailure({ fieldName: fieldName2 });
          expect(output.getWarnings()).toMatchSnapshot();
        });
      });

      describe("When field specified", () => {
        it("Should return warning array for a given field", () => {
          expect(output.getWarnings()).toEqual({});
          res.markFailure({ fieldName: fieldName1, isWarning: true });
          res.markFailure({
            fieldName: fieldName2,
            statement,
            isWarning: true,
          });
          res.markFailure({ fieldName: fieldName2 });
          expect(output.getWarnings(fieldName1)).toEqual([]);
          expect(output.getWarnings(fieldName2)).toEqual([statement]);
          res.markFailure({
            fieldName: fieldName2,
            statement: statement2,
            isWarning: true,
          });
          expect(output.getWarnings(fieldName2)).toEqual([
            statement,
            statement2,
          ]);
        });

        describe("When field doesn't exist", () => {
          it("Should return an empty array", () => {
            expect(output.getWarnings("I Do Not Exist")).toEqual([]);
          });
        });
      });
    });

    describe("done + cancel", () => {
      let cb1, cb2, cb3, cb4, testObject1, testObject2;

      beforeEach(() => {
        cb1 = jest.fn();
        cb2 = jest.fn();
        cb3 = jest.fn();
        cb4 = jest.fn();
      });

      describe("When no async tests", () => {
        beforeEach(() => {
          [fieldName1, fieldName2].forEach(res.markTestRun);
        });

        it("Should invoke callback functions immediately", () => {
          expect(cb1).not.toHaveBeenCalled();
          res.output.done(cb1);
          expect(cb1).toHaveBeenCalledWith(res.output);
          expect(cb2).not.toHaveBeenCalled();
          res.output.done(fieldName1, cb2);
          expect(cb2).toHaveBeenCalledWith(res.output);
        });

        describe("When cancel gets called", () => {
          beforeEach(() => {
            res.output.cancel();
          });

          it("Should run normally", () => {
            expect(cb1).not.toHaveBeenCalled();
            res.output.done(cb1);
            expect(cb1).toHaveBeenCalledWith(res.output);
            expect(cb2).not.toHaveBeenCalled();
            res.output.done(fieldName1, cb2);
            expect(cb2).toHaveBeenCalledWith(res.output);
          });
        });
      });

      describe("When async tests exist", () => {
        beforeEach(() => {
          testObject1 = new TestObject({}, fieldName1, null, jest.fn());
          testObject2 = new TestObject({}, fieldName2, null, jest.fn());
          [fieldName1, fieldName2].forEach(res.markTestRun);
          res.setPending(testObject1);
          res.setPending(testObject2);
        });

        it("Should return and not call callbacks immediately", () => {
          expect(cb1).not.toHaveBeenCalled();
          expect(cb2).not.toHaveBeenCalled();
          expect(cb3).not.toHaveBeenCalled();
          res.output.done(cb1);
          res.output.done(cb2);
          res.output.done(cb3);
          expect(cb1).not.toHaveBeenCalled();
          expect(cb2).not.toHaveBeenCalled();
          expect(cb3).not.toHaveBeenCalled();
        });

        it("Should invoke all functions after all async tests are done", (done) => {
          res.output.done(cb1);
          res.output.done(cb2);
          res.output.done(cb3);
          res.output.done(cb4);
          setTimeout(() => {
            res.markAsDone(testObject1);
            expect(cb1).not.toHaveBeenCalled();
            expect(cb2).not.toHaveBeenCalled();
            expect(cb3).not.toHaveBeenCalled();
            expect(cb4).not.toHaveBeenCalled();
          });

          setTimeout(() => {
            res.markAsDone(testObject2);
            expect(cb1).toHaveBeenCalledWith(res.output);
            expect(cb2).toHaveBeenCalledWith(res.output);
            expect(cb3).toHaveBeenCalledWith(res.output);
            expect(cb4).toHaveBeenCalledWith(res.output);
            done();
          }, 100);
        });

        describe("When called with a field name", () => {
          describe("When field named field is sync", () => {
            it("Should only invoke named callback immediately", () => {
              expect(cb1).not.toHaveBeenCalled();
              res.output.done(faker.lorem.word(), cb1);
              res.output.done(cb2);
              res.output.done(cb3);
              res.output.done(cb4);
              expect(cb1).toHaveBeenCalledWith(output);
              expect(cb2).not.toHaveBeenCalled();
              expect(cb3).not.toHaveBeenCalled();
              expect(cb4).not.toHaveBeenCalled();
            });
          });

          describe("When field named field is async", () => {
            it("Should only invoke named callback after its test is complete", () => {
              expect(cb3).not.toHaveBeenCalled();
              res.output.done(fieldName1, cb3);
              res.output.done(cb1);
              res.output.done(cb2);
              res.output.done(cb4);

              expect(cb1).not.toHaveBeenCalled();
              expect(cb2).not.toHaveBeenCalled();
              expect(cb3).not.toHaveBeenCalled();
              expect(cb4).not.toHaveBeenCalled();

              res.markAsDone(testObject1);
              expect(cb3).toHaveBeenCalledWith(output);
              expect(cb1).not.toHaveBeenCalled();
              expect(cb2).not.toHaveBeenCalled();
              expect(cb4).not.toHaveBeenCalled();
            });
          });
        });

        describe("When cancel gets called before running callbacks", () => {
          it("Should exit without running any left over callbacks", () => {
            res.output.done(fieldName1, cb3);
            res.output.done(cb1);
            res.output.done(cb2);
            res.output.done(cb4);
            res.markAsDone(testObject1);
            expect(cb3).toHaveBeenCalledWith(output);
            res.output.cancel();
            res.markAsDone();
            expect(cb1).not.toHaveBeenCalled();
            expect(cb2).not.toHaveBeenCalled();
            expect(cb4).not.toHaveBeenCalled();
          });
        });
      });

      test("Cancel adds `canceled = true` to output object", () => {
        expect(res.output.canceled).toBe(undefined);
        res.output.cancel();
        expect(res.output.canceled).toBe(true);
      });
    });
  });
});
