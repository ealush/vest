/* eslint-disable jest/no-export */
import faker from 'faker';
import vest from '../../src';

const testDummy = (vestRef = vest) => {
  const { test } = vestRef;
  const failing = (
    name = faker.random.word(),
    statement = faker.random.words()
  ) =>
    test(name, statement, () => {
      throw new Error();
    });

  const failingWarning = (
    name = faker.random.word(),
    statement = faker.random.words()
  ) =>
    test(name, statement, () => {
      vest.warn();
      throw new Error();
    });

  const passing = (
    name = faker.random.word(),
    statement = faker.random.words()
  ) => test(name, statement, Function.prototype);

  const passingWarning = (
    name = faker.random.word(),
    statement = faker.random.words()
  ) =>
    test(name, statement, () => {
      vest.warn();
    });

  const failingAsync = (
    name = faker.random.word(),
    { statement, time = 0 } = {}
  ) =>
    test(
      name,
      statement,
      () =>
        new Promise((resolve, reject) => {
          setTimeout(reject, time);
        })
    );

  const failingWarningAsync = (
    name = faker.random.word(),
    { statement, time = 0 } = {}
  ) =>
    test(name, statement, () => {
      vest.warn();
      return new Promise((resolve, reject) => {
        setTimeout(reject, time);
      });
    });

  const passingAsync = (
    name = faker.random.word(),
    { statement, time = 0 } = {}
  ) =>
    test(
      name,
      statement,
      () =>
        new Promise(resolve => {
          setTimeout(resolve, time);
        })
    );

  const passingWarningAsync = (
    name = faker.random.word(),
    { statement, time = 0 } = {}
  ) =>
    test(name, statement, () => {
      vest.warn();
      return new Promise(resolve => {
        setTimeout(resolve, time);
      });
    });

  return {
    failing,
    passing,
    failingAsync,
    passingAsync,
    failingWarning,
    failingWarningAsync,
    passingWarning,
    passingWarningAsync,
  };
};

export default testDummy;

export const dummyTest = testDummy();
