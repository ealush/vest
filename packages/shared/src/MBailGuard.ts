import optionalFunctionValue from 'optionalFunctionValue';
import { CB } from 'utilityTypes';

export function BailGuard<T extends CB>(fn: T) {
  let bailed = false;

  const wrapped = Wrap(
    // @ts-expect-error - ...args is not CB 🙈
    (...args: Parameters<T>) => {
      if (!didBail()) {
        return fn(...args);
      }
    },
    {
      Guard,
    }
  );

  const bail = () => (bailed = true);
  const didBail = () => bailed;

  return wrapped;

  function Guard<G extends CB>(guard: G | boolean): TWrapped<T> {
    return Guarded(
      // @ts-expect-error - ...args is not CB 🙈
      (...args: Parameters<T>) => {
        if (didBail()) {
          return;
        }

        const res = optionalFunctionValue<boolean | void>(guard, ...args);

        if (res === false) {
          bail();
        }

        return wrapped(...args);
      },
      [didBail, bail]
    );
  }
}

function Guarded<T extends CB>(fn: T, [didBail, bail]: BailState) {
  const wrapped: TWrapped<T> = Wrap(fn, {
    Guard,
    Bail,
  });

  return wrapped;

  function Guard<G extends CB>(guard: G | boolean) {
    return Guarded(
      (...args) => {
        if (didBail()) {
          return;
        }

        const res = optionalFunctionValue<boolean | void>(guard, ...args);

        if (res === false) {
          bail();
        }

        // @ts-expect-error - ...args is not CB 🙈
        return wrapped(...args);
      },
      [didBail, bail]
    );
  }

  function Bail(bail: ReturnType<T> | T) {
    return (...args: Parameters<T>) => {
      const output = fn(...args);
      return didBail() ? optionalFunctionValue(bail, ...args) : output;
    };
  }
}

function Wrap<T extends CB, K extends Record<string, CB>>(
  fn: T,
  properties: K
) {
  return Object.assign((...args: Parameters<T>) => fn(...args), properties);
}

type TWrapped<T extends CB> = ((...args: Parameters<T>) => void) & {
  Guard: <G extends CB>(guard: boolean | G) => TWrapped<T>;
  Bail: (bail: ReturnType<T> | T) => any;
};

type BailState = (() => boolean)[];
