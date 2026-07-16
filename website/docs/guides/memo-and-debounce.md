---
title: Reduce Repeated Async Validation
description: Combine memoization, debouncing, and cancellation without weakening Vest's stale-result protection.
keywords:
  [async validation debounce, validation memoization, Vest memo, Vest debounce]
---

# Reduce Repeated Async Validation

Race safety keeps old asynchronous results from corrupting current state. It does not prevent an application from starting unnecessary work. Vest provides two separate tools for reducing that work:

| Tool                           | Use it when                                       | What it does                                                        |
| ------------------------------ | ------------------------------------------------- | ------------------------------------------------------------------- |
| `memo(callback, dependencies)` | The same relevant inputs may be validated again   | Restores the tests and results produced for a cached dependency set |
| `debounce(callback, delay)`    | Rapid interactions should wait for a quiet period | Delays a test and keeps the latest invocation                       |

Neither mechanism replaces stale-result protection. Continue passing the test's `AbortSignal` to abortable work.

## Build a coupon check

```ts
import { create, enforce, test } from 'vest';
import debounce from 'vest/debounce';
import { memo } from 'vest/memo';

type CouponData = {
  cartTotal: number;
  coupon: string;
};

async function checkCoupon(
  data: CouponData,
  signal: AbortSignal,
): Promise<boolean> {
  const response = await fetch('/api/coupons/validate', {
    body: JSON.stringify(data),
    headers: { 'content-type': 'application/json' },
    method: 'POST',
    signal,
  });
  if (!response.ok) throw new Error('Coupon service failed');
  const body: { valid: boolean } = await response.json();
  return body.valid;
}

export const couponSuite = create((data: CouponData) => {
  test('coupon', 'Coupon must contain exactly 8 characters', () => {
    enforce(data.coupon).lengthEquals(8);
  });

  memo(
    () => {
      test(
        'coupon',
        'Coupon is not valid for this cart',
        debounce(async ({ signal }) => {
          enforce(await checkCoupon(data, signal)).isTruthy();
        }, 300),
      );
    },
    [data.coupon, data.cartTotal],
    { cacheSize: 10, ttl: 30_000 },
  );
});
```

The dependency list contains both values that influence the remote conclusion. Reusing the coupon with a different cart total must create a different cache entry.

## Run it like any other async suite

```ts
const result = couponSuite.only('coupon').run({
  cartTotal: 120,
  coupon: 'SAVE0025',
});

showPending(result.isPending('coupon'));
await result;
renderErrors(result.getErrors('coupon'));
```

Debounced tests are asynchronous even when their inner callback is synchronous. Read the immediate result for pending and synchronous status, then await it or use an `afterEach` bridge for completion updates.

## Choose the smallest optimization

- Use only `debounce` when values rarely repeat but interactions arrive in bursts.
- Use only `memo` when the application revisits a small number of dependency combinations.
- Combine them when both behaviors occur and the cached answer is safe to reuse.
- Skip caching when the answer is authoritative, volatile, or unsafe to retain. A short `ttl` can bound reuse when limited caching is acceptable.

## Common mistakes

| Mistake                                                         | Correction                                                          |
| --------------------------------------------------------------- | ------------------------------------------------------------------- |
| Omitting a value that affects validity from the dependency list | Include every input used by the memoized block                      |
| Importing the removed `test.memo` API                           | Import `memo` from `vest/memo`                                      |
| Importing `debounce` from the main package                      | Import the default export from `vest/debounce`                      |
| Treating debounce as race protection                            | Keep Vest's normal async lifecycle and pass `signal` to the request |
| Forgetting that a debounced test is pending                     | Render pending state and handle asynchronous completion             |

Next, read [async validation without race conditions](./async-validation-race-conditions.md) for result authority and cancellation, or the [`memo`](../writing_tests/advanced_test_features/memo.md) and [`debounce`](../writing_tests/advanced_test_features/debounce.md) references for API details.
