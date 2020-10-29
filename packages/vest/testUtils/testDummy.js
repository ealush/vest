/* eslint-disable jest/no-export */
import faker from 'faker';

import vest from '../src';

/**
 * Generates dummy vest tests.
 * @param {Object} [vestRef] Reference to vest build.
 */
const testDummy = (vestRef = vest) => {
  const { test } = vestRef;
  const failing = (
    name = faker.random.word(),
    statement = faker.random.words()
  ) =>
    test(
      name,
      statement,
      jest.fn(() => {
        throw new Error();
      })
    );

  const failingWarning = (
    name = faker.random.word(),
    statement = faker.random.words()
  ) =>
    test(
      name,
      statement,
      jest.fn(() => {
        vest.warn();
        throw new Error();
      })
    );

  const passing = (
    name = faker.random.word(),
    statement = faker.random.words()
  ) => test(name, statement, jest.fn());

  const passingWarning = (
    name = faker.random.word(),
    statement = faker.random.words()
  ) =>
    test(
      name,
      statement,
      jest.fn(() => {
        vest.warn();
      })
    );

  const failingAsync = (
    name = faker.random.word(),
    { statement, time = 0 } = {}
  ) =>
    test(
      name,
      statement,
      jest.fn(
        () =>
          new Promise((resolve, reject) => {
            setTimeout(reject, time);
          })
      )
    );

  const failingWarningAsync = (
    name = faker.random.word(),
    { statement, time = 0 } = {}
  ) =>
    test(
      name,
      statement,
      jest.fn(() => {
        vest.warn();
        return new Promise((resolve, reject) => {
          setTimeout(reject, time);
        });
      })
    );

  const passingAsync = (
    name = faker.random.word(),
    { statement, time = 0 } = {}
  ) =>
    test(
      name,
      statement,
      jest.fn(
        () =>
          new Promise(resolve => {
            setTimeout(resolve, time);
          })
      )
    );

  const passingWarningAsync = (
    name = faker.random.word(),
    { statement, time = 0 } = {}
  ) =>
    test(
      name,
      statement,
      jest.fn(() => {
        vest.warn();
        return new Promise(resolve => {
          setTimeout(resolve, time);
        });
      })
    );

  return {
    failing,
    failingAsync,
    failingWarning,
    failingWarningAsync,
    passing,
    passingAsync,
    passingWarning,
    passingWarningAsync,
  };
};

export default testDummy;

export const dummyTest = testDummy();
