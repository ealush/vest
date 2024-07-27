/* eslint-disable jest/valid-title */
import { faker } from '@faker-js/faker';

import { test as vestTest, warn } from 'vest';

/**
 * Generates dummy vest tests.
 */
// eslint-disable-next-line max-lines-per-function
const testDummy = () => {
  const failing = (
    name: string = faker.lorem.word(),
    message: string = faker.lorem.words(),
  ) => {
    const to = vestTest(
      name,
      message,
      jest.fn(() => {
        throw new Error();
      }),
    );

    return to;
  };

  const failingWarning = (
    name = faker.lorem.word(),
    message = faker.lorem.words(),
  ) => {
    const to = vestTest(
      name,
      message,
      jest.fn(() => {
        warn();
        throw new Error();
      }),
    );

    return to;
  };

  const passing = (
    name = faker.lorem.word(),
    message = faker.lorem.words(),
  ) => {
    const to = vestTest(name, message, jest.fn());

    return to;
  };

  const passingWarning = (
    name = faker.lorem.word(),
    message = faker.lorem.words(),
  ) => {
    const to = vestTest(
      name,
      message,
      jest.fn(() => {
        warn();
      }),
    );
    return to;
  };

  const failingAsync = (
    name = faker.lorem.word(),
    { message = faker.lorem.words(), time = 0 } = {},
  ) =>
    vestTest(
      name,
      message,
      jest.fn(
        () =>
          new Promise((_, reject) => {
            setTimeout(reject, time);
          }),
      ),
    );

  const failingWarningAsync = (
    name = faker.lorem.word(),
    { message = faker.lorem.words(), time = 0 } = {},
  ) =>
    vestTest(
      name,
      message,
      jest.fn(() => {
        warn();
        return new Promise((_, reject) => {
          setTimeout(reject, time);
        });
      }),
    );

  const passingAsync = (
    name = faker.lorem.word(),
    { message = faker.lorem.words(), time = 0 } = {},
  ) =>
    vestTest(
      name,
      message,
      jest.fn(
        () =>
          new Promise(resolve => {
            setTimeout(resolve, time);
          }),
      ),
    );

  const passingWarningAsync = (
    name = faker.lorem.word(),
    { message = faker.lorem.words(), time = 0 } = {},
  ) =>
    vestTest(
      name,
      message,
      jest.fn(() => {
        warn();
        return new Promise(resolve => {
          setTimeout(resolve, time);
        });
      }),
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

export const dummyTest = testDummy();

export type TDummyTest = typeof dummyTest;
