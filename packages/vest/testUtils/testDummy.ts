/* eslint-disable jest/no-export */
import faker from 'faker';

import * as vest from 'vest';

/**
 * Generates dummy vest tests.
 * @param {Object} [vestRef] Reference to vest build.
 */
const testDummy = (vestRef = vest) => {
  const { test } = vestRef;
  const failing = (
    name: string = faker.random.word(),
    message: string = faker.random.words(),
    groupName?: string
  ) => {
    const to = test(
      name,
      message,
      jest.fn(() => {
        throw new Error();
      })
    );

    if (groupName) {
      to.groupName = groupName;
    }

    return to;
  };

  const failingWarning = (
    name = faker.random.word(),
    message = faker.random.words(),
    groupName?: string
  ) => {
    const to = test(
      name,
      message,
      jest.fn(() => {
        vest.warn();
        throw new Error();
      })
    );

    if (groupName) {
      to.groupName = groupName;
    }

    return to;
  };

  const passing = (
    name = faker.random.word(),
    message = faker.random.words(),
    groupName?: string
  ) => {
    const to = test(name, message, jest.fn());

    if (groupName) {
      to.groupName = groupName;
    }

    return to;
  };

  const passingWarning = (
    name = faker.random.word(),
    message = faker.random.words(),
    groupName?: string
  ) => {
    const to = test(
      name,
      message,
      jest.fn(() => {
        vest.warn();
      })
    );
    if (groupName) {
      to.groupName = groupName;
    }
    return to;
  };

  const failingAsync = (
    name = faker.random.word(),
    { message = faker.random.words(), time = 0 } = {}
  ) =>
    test(
      name,
      message,
      jest.fn(
        () =>
          new Promise((_, reject) => {
            setTimeout(reject, time);
          })
      )
    );

  const failingWarningAsync = (
    name = faker.random.word(),
    { message = faker.random.words(), time = 0 } = {}
  ) =>
    test(
      name,
      message,
      jest.fn(() => {
        vest.warn();
        return new Promise((_, reject) => {
          setTimeout(reject, time);
        });
      })
    );

  const passingAsync = (
    name = faker.random.word(),
    { message = faker.random.words(), time = 0 } = {}
  ) =>
    test(
      name,
      message,
      jest.fn(
        () =>
          new Promise(resolve => {
            setTimeout(resolve, time);
          })
      )
    );

  const passingWarningAsync = (
    name = faker.random.word(),
    { message = faker.random.words(), time = 0 } = {}
  ) =>
    test(
      name,
      message,
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
