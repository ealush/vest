import { isObject } from './valueIsObject';

export type Result<T, E = unknown> = Success<T, E> | Failure<T, E>;

type Success<T, E> = {
  chain<U, E2 = E>(fn: (value: T) => Result<U, E2>): Result<U, E | E2>;
  map<U>(fn: (value: T) => U): Result<U, E>;
  mapError<E2>(fn: (error: E) => E2): Result<T, E2>;
  match<U>(handlers: { ok: (value: T) => U; err: (error: E) => U }): U;
  readonly type: 'ok';
  unwrap(): T;
  unwrapOr(defaultValue: T): T;
  readonly value: T;
};

export type Failure<T, E> = {
  chain<U, E2 = E>(fn: (value: T) => Result<U, E2>): Result<U, E | E2>;
  readonly error: E;
  map<U>(fn: (value: T) => U): Result<U, E>;
  mapError<E2>(fn: (error: E) => E2): Result<T, E2>;
  match<U>(handlers: { ok: (value: T) => U; err: (error: E) => U }): U;
  readonly type: 'err';
  unwrap(): T;
  unwrapOr(defaultValue: T): T;
};

function ok<T, E = unknown>(value: T): Success<T, E> {
  return {
    chain<U, E2 = E>(fn: (inner: T) => Result<U, E2>) {
      return fn(value) as Result<U, E | E2>;
    },
    map<U>(fn: (inner: T) => U) {
      return ok<U, E>(fn(value));
    },
    mapError<E2>(_fn: (error: E) => E2) {
      return this as unknown as Success<T, E2>;
    },
    match<U>(handlers: { ok: (val: T) => U; err: (err: E) => U }) {
      return handlers.ok(value);
    },
    type: 'ok',
    unwrap() {
      return value;
    },
    unwrapOr(_defaultValue: T) {
      return value;
    },
    value,
  };
}

function err<T = never, E = unknown>(error: E): Failure<T, E> {
  return {
    chain<U, E2 = E>(_fn: (inner: T) => Result<U, E2>) {
      return this as unknown as Failure<U, E | E2>;
    },
    error,
    map<U>(_fn: (inner: T) => U) {
      return this as unknown as Failure<U, E>;
    },
    mapError<E2>(fn: (inner: E) => E2) {
      return err<T, E2>(fn(error));
    },
    match<U>(handlers: { ok: (val: T) => U; err: (err: E) => U }) {
      return handlers.err(error);
    },
    type: 'err',
    unwrap() {
      throw error instanceof Error ? error : new Error(String(error));
    },
    unwrapOr(defaultValue: T) {
      return defaultValue;
    },
  };
}

export const makeResult = { Ok: ok, Err: err } as const;

const hasResultType = (candidate: { type?: unknown }): boolean =>
  candidate.type === 'ok' || candidate.type === 'err';

const hasResultShape = (candidate: Record<string, unknown>): boolean =>
  'value' in candidate || 'error' in candidate;

export function isResult(value: unknown): value is Result<unknown, unknown> {
  if (!isObject(value)) {
    return false;
  }

  const candidate = value as { type?: unknown } & Record<string, unknown>;

  if (!hasResultShape(candidate)) {
    return false;
  }

  return hasResultType(candidate);
}

export function isSuccess<T, E>(value: Result<T, E>): value is Success<T, E> {
  return value.type === 'ok';
}

export function isFailure<T, E>(value: Result<T, E>): value is Failure<T, E> {
  return value.type === 'err';
}

/**
 * Unwraps a Result.
 * If the Result is Success, it returns the value.
 * If the Result is Failure, it throws the error.
 */
export function unwrap<T>(result: Result<T, any>): T {
  if (isFailure(result)) {
    // Ensure we always throw an Error object for better stack traces
    throw result.error instanceof Error
      ? result.error
      : new Error(String(result.error));
  }

  return result.value;
}
