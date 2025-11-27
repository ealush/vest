import { describe, it, expect, vi } from 'vitest';

import { Brand, makeBrand } from '../Brand';
import { IO } from '../IO';
import { makeResult, isResult, isSuccess, isFailure } from '../Result';

// --- CONTRACT: Branded Types ---
describe('Architecture: Branded Types', () => {
  type UserId = Brand<string, 'UserId'>;
  type PostId = Brand<string, 'PostId'>;

  it('should not allow assignment of raw string to Branded type (Static Check)', () => {
    const raw = 'user_123';
    const userId = makeBrand<UserId>(raw);
    // @ts-expect-error PostId is not assignable to UserId
    const _postId: PostId = userId;

    expect(userId).toBe(raw);
  });
});

// --- CONTRACT: Result/Error Handling ---
describe('Architecture: Result Monad', () => {
  it('should encapsulate errors as values', () => {
    const errorResult = makeResult.Err('Something went wrong');
    expect(isFailure(errorResult)).toBe(true);
    expect(errorResult.error).toBe('Something went wrong');
  });

  it('should encapsulate success values', () => {
    const successResult = makeResult.Ok(42);
    expect(isSuccess(successResult)).toBe(true);
    expect(successResult.value).toBe(42);
  });

  it('should support mapping without throwing', () => {
    const val = makeResult.Ok(10);
    const newResult = val.map(x => x * 2);

    expect(isSuccess(newResult)).toBe(true);
    // @ts-ignore
    expect(newResult.value).toBe(20);
  });

  it('should identify generic result shapes', () => {
    const okShape = makeResult.Ok('ok');
    const errShape = makeResult.Err('err');
    expect(isResult(okShape)).toBe(true);
    expect(isResult(errShape)).toBe(true);
    expect(isResult({})).toBe(false);
  });
});

// --- CONTRACT: Explicit Side Effects (IO) ---
describe('Architecture: IO / Effect', () => {
  it('should not execute side effect immediately', () => {
    const spy = vi.fn();

    const sideEffectFn = (): IO<void> => {
      return () => spy();
    };

    const effect = sideEffectFn();
    expect(spy).not.toHaveBeenCalled();

    effect();
    expect(spy).toHaveBeenCalled();
  });
});
