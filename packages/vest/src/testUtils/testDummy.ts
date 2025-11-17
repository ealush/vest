import { faker } from '@faker-js/faker';
import { vi } from 'vitest';
import wait from 'wait';

import { test as vestTest, warn } from '../vest';

/**
 * Generates dummy vest tests.
 */
const createFailing = (
  name: string = faker.lorem.word(),
  message: string = faker.lorem.words(),
) =>
  vestTest(
    name,
    message,
    vi.fn(() => {
      throw new Error();
    }),
  );

const createFailingWarning = (
  name = faker.lorem.word(),
  message = faker.lorem.words(),
) =>
  vestTest(
    name,
    message,
    vi.fn(() => {
      warn();
      throw new Error();
    }),
  );

const createPassing = (
  name = faker.lorem.word(),
  message = faker.lorem.words(),
) => vestTest(name, message, vi.fn());

const createPassingWarning = (
  name = faker.lorem.word(),
  message = faker.lorem.words(),
) =>
  vestTest(
    name,
    message,
    vi.fn(() => {
      warn();
    }),
  );

const createFailingAsync = (
  name = faker.lorem.word(),
  { message = faker.lorem.words(), time = 0 } = {},
) =>
  vestTest(
    name,
    message,
    vi.fn(async () => {
      await wait(time);
      throw new Error();
    }),
  );

const createFailingWarningAsync = (
  name = faker.lorem.word(),
  { message = faker.lorem.words(), time = 0 } = {},
) =>
  vestTest(
    name,
    message,
    vi.fn(async () => {
      warn();
      await wait(time);
      throw new Error();
    }),
  );

const createPassingAsync = (
  name = faker.lorem.word(),
  { message = faker.lorem.words(), time = 0 } = {},
) =>
  vestTest(
    name,
    message,
    vi.fn(async () => {
      await wait(time);
    }),
  );

const createPassingWarningAsync = (
  name = faker.lorem.word(),
  { message = faker.lorem.words(), time = 0 } = {},
) =>
  vestTest(
    name,
    message,
    vi.fn(async () => {
      warn();
      await wait(time);
    }),
  );

const testDummy = () => ({
  failing: createFailing,
  failingAsync: createFailingAsync,
  failingWarning: createFailingWarning,
  failingWarningAsync: createFailingWarningAsync,
  passing: createPassing,
  passingAsync: createPassingAsync,
  passingWarning: createPassingWarning,
  passingWarningAsync: createPassingWarningAsync,
});

export const dummyTest = testDummy();
