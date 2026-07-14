import { afterEach, describe, expect, it, vi } from 'vitest';

import debounce from '../../exports/debounce';
import { memo } from '../../exports/memo';
import { create, enforce, skipWhen, test, useWarn } from '../../vest';

declare global {
  namespace n4s {
    interface EnforceMatchers {
      tutorialMatchesField: (value: string, fieldName: string) => boolean;
    }
  }
}

describe('ten-tutorial learning path examples', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('memoizes a completed debounced validation by every dependency', async () => {
    vi.useFakeTimers();
    const checkCoupon = vi.fn().mockResolvedValue(true);
    const suite = create((data: { cartTotal: number; coupon: string }) => {
      memo(
        () => {
          test(
            'coupon',
            'Coupon is not valid for this cart',
            debounce(async ({ signal }) => {
              enforce(signal.aborted).isFalsy();
              enforce(await checkCoupon(data)).isTruthy();
            }, 300),
          );
        },
        [data.coupon, data.cartTotal],
        { cacheSize: 10, ttl: 30_000 },
      );
    });

    const first = suite
      .only('coupon')
      .run({ cartTotal: 120, coupon: 'SAVE0025' });
    expect(first.isPending('coupon')).toBe(true);
    await vi.advanceTimersByTimeAsync(300);
    await first;

    const repeated = suite
      .only('coupon')
      .run({ cartTotal: 120, coupon: 'SAVE0025' });
    await repeated;
    expect(checkCoupon).toHaveBeenCalledTimes(1);

    const changedDependency = suite
      .only('coupon')
      .run({ cartTotal: 45, coupon: 'SAVE0025' });
    await vi.advanceTimersByTimeAsync(300);
    await changedDependency;
    expect(checkCoupon).toHaveBeenCalledTimes(2);
  });

  it('captures warning context before awaiting an asynchronous decision', async () => {
    const suite = create((data: { username: string }) => {
      test('username', 'This username is very common', async () => {
        const markAsWarning = useWarn();
        const common = await Promise.resolve(data.username === 'user');

        if (common) markAsWarning();
        enforce(common).isFalsy();
      });
    });

    const result = await suite.runStatic({ username: 'user' });

    expect(result.hasWarnings('username')).toBe(true);
    expect(result.hasErrors('username')).toBe(false);
    expect(result.isValid()).toBe(true);
  });

  it('enters a skipped wrapper without running its test body', () => {
    const wrapperWork = vi.fn();
    const testWork = vi.fn();
    const suite = create(() => {
      skipWhen(true, () => {
        wrapperWork();
        test('remote', () => {
          testWork();
        });
      });
    });

    suite.runStatic();

    expect(wrapperWork).toHaveBeenCalledOnce();
    expect(testWork).not.toHaveBeenCalled();
  });

  it('reads sibling values from a context-aware custom rule', () => {
    enforce.extend({
      tutorialMatchesField: (value: string, fieldName: string) => {
        const parent = enforce.context()?.parent()?.value;
        return value === parent?.[fieldName];
      },
    });

    const schema = enforce.shape({
      confirm: enforce.isString().tutorialMatchesField('password'),
      password: enforce.isString(),
    });
    const suite = create(() => {}, schema);

    expect(
      suite.runStatic({ confirm: 'secret', password: 'secret' }).hasErrors(),
    ).toBe(false);
    expect(
      suite.runStatic({ confirm: 'different', password: 'secret' }).hasErrors(),
    ).toBe(true);
  });
});
