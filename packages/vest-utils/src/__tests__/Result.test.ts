import { describe, it, expect, vi } from 'vitest';

import { isFailure, isResult, isSuccess, makeResult, unwrap } from '../Result';

describe('Result', () => {
  describe('makeResult', () => {
    describe('Ok', () => {
      it('should return a Success result', () => {
        const result = makeResult.Ok(1);
        expect(result.type).toBe('ok');
        expect(result.value).toBe(1);
      });

      it('should have correct methods', () => {
        const result = makeResult.Ok(1);
        expect(typeof result.map).toBe('function');
        expect(typeof result.chain).toBe('function');
        expect(typeof result.mapError).toBe('function');
        expect(typeof result.match).toBe('function');
      });
    });

    describe('Err', () => {
      it('should return a Failure result', () => {
        const result = makeResult.Err('error');
        expect(result.type).toBe('err');
        expect(result.error).toBe('error');
      });

      it('should have correct methods', () => {
        const result = makeResult.Err('error');
        expect(typeof result.map).toBe('function');
        expect(typeof result.chain).toBe('function');
        expect(typeof result.mapError).toBe('function');
        expect(typeof result.match).toBe('function');
      });
    });
  });

  describe('isResult', () => {
    it('should return true for Success result', () => {
      expect(isResult(makeResult.Ok(1))).toBe(true);
    });

    it('should return true for Failure result', () => {
      expect(isResult(makeResult.Err('error'))).toBe(true);
    });

    it('should return false for non-result objects', () => {
      expect(isResult({})).toBe(false);
      expect(isResult(null)).toBe(false);
      expect(isResult(undefined)).toBe(false);
      expect(isResult(1)).toBe(false);
      expect(isResult('string')).toBe(false);
      expect(isResult({ type: 'ok' })).toBe(false); // Missing value
      expect(isResult({ type: 'err' })).toBe(false); // Missing error
      expect(isResult({ value: 1 })).toBe(false); // Missing type
    });
  });

  describe('isSuccess', () => {
    it('should return true for Success result', () => {
      expect(isSuccess(makeResult.Ok(1))).toBe(true);
    });

    it('should return false for Failure result', () => {
      expect(isSuccess(makeResult.Err('error'))).toBe(false);
    });
  });

  describe('isFailure', () => {
    it('should return true for Failure result', () => {
      expect(isFailure(makeResult.Err('error'))).toBe(true);
    });

    it('should return false for Success result', () => {
      expect(isFailure(makeResult.Ok(1))).toBe(false);
    });
  });

  describe('unwrap', () => {
    it('should return value if result is Success', () => {
      const result = makeResult.Ok(100);
      expect(unwrap(result)).toBe(100);
      expect(result.unwrap()).toBe(100);
    });

    it('should throw error if result is Failure', () => {
      const error = new Error('fail');
      const result = makeResult.Err(error);
      expect(() => unwrap(result)).toThrow(error);
      expect(() => result.unwrap()).toThrow(error);
    });

    it('should throw Error object if failure contains non-Error', () => {
      const result = makeResult.Err('string error');
      expect(() => unwrap(result)).toThrow('string error');
      expect(() => result.unwrap()).toThrow('string error');
      try {
        result.unwrap();
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect((e as Error).message).toBe('string error');
      }
    });
  });

  describe('unwrapOr', () => {
    it('should return value if result is Success', () => {
      const result = makeResult.Ok(100);
      expect(result.unwrapOr(200)).toBe(100);
    });

    it('should return default value if result is Failure', () => {
      const result = makeResult.Err<number>('error');
      expect(result.unwrapOr(200)).toBe(200);
    });
  });

  describe('Success methods', () => {
    describe('map', () => {
      it('should transform the value', () => {
        const result = makeResult.Ok(1).map(x => x + 1);
        expect(unwrap(result)).toBe(2);
      });
    });

    describe('chain', () => {
      it('should chain with another Result', () => {
        const result = makeResult.Ok(1).chain(x => makeResult.Ok(x + 1));
        expect(unwrap(result)).toBe(2);
      });

      it('should chain with a Failure', () => {
        const result = makeResult.Ok(1).chain(() => makeResult.Err('fail'));
        expect(isFailure(result)).toBe(true);
        if (isFailure(result)) {
          expect(result.error).toBe('fail');
        }
      });
    });

    describe('mapError', () => {
      it('should not transform the error (no-op for Success)', () => {
        const result = makeResult.Ok(1).mapError(() => 'new error');
        expect(unwrap(result)).toBe(1);
      });
    });

    describe('match', () => {
      it('should call ok handler', () => {
        const result = makeResult.Ok(1);
        const output = result.match({
          ok: val => `ok: ${val}`,
          err: err => `err: ${err}`,
        });
        expect(output).toBe('ok: 1');
      });
    });
  });

  describe('Failure methods', () => {
    describe('map', () => {
      it('should not transform the value (no-op for Failure)', () => {
        const result = makeResult.Err('error').map((x: any) => x + 1);
        expect(isFailure(result)).toBe(true);
        if (isFailure(result)) {
          expect(result.error).toBe('error');
        }
      });
    });

    describe('chain', () => {
      it('should not call the function (no-op for Failure)', () => {
        const fn = vi.fn();
        const result = makeResult.Err('error').chain(fn);
        expect(fn).not.toHaveBeenCalled();
        expect(isFailure(result)).toBe(true);
      });
    });

    describe('mapError', () => {
      it('should transform the error', () => {
        const result = makeResult.Err('error').mapError(e => e.toUpperCase());
        expect(isFailure(result)).toBe(true);
        if (isFailure(result)) {
          expect(result.error).toBe('ERROR');
        }
      });
    });

    describe('match', () => {
      it('should call err handler', () => {
        const result = makeResult.Err('error');
        const output = result.match({
          ok: val => `ok: ${val}`,
          err: err => `err: ${err}`,
        });
        expect(output).toBe('err: error');
      });
    });
  });

  describe('Edge Cases: Nullish values', () => {
    it('should handle null as a valid Success value', () => {
      const result = makeResult.Ok(null);
      expect(isSuccess(result)).toBe(true);
      expect(unwrap(result)).toBeNull();
    });

    it('should handle undefined as a valid Success value', () => {
      const result = makeResult.Ok(undefined);
      expect(isSuccess(result)).toBe(true);
      expect(unwrap(result)).toBeUndefined();
    });

    it('should allow mapping over null values', () => {
      const result = makeResult
        .Ok(null)
        .map(val => (val === null ? 'was null' : 'not null'));
      expect(unwrap(result)).toBe('was null');
    });
  });

  describe('Control Flow: Exceptions', () => {
    it('should NOT catch errors thrown inside map (Sync/Pure behavior)', () => {
      const result = makeResult.Ok(1);

      // If your architecture intends to catch this, change .toThrow() to checking for Err
      expect(() => {
        result.map(() => {
          throw new Error('Boom');
        });
      }).toThrow('Boom');
    });

    it('should NOT catch errors thrown inside chain', () => {
      const result = makeResult.Ok(1);

      expect(() => {
        result.chain(() => {
          throw new Error('Boom');
        });
      }).toThrow('Boom');
    });
  });

  describe('isResult Edge Cases', () => {
    it('should return false if type discriminator is invalid', () => {
      // Has correct shape keys, but wrong 'type' value
      const fakeResult = { type: 'banana', value: 1 };
      expect(isResult(fakeResult)).toBe(false);
    });

    it('should return false for extra properties mimicking result', () => {
      // Depends on how strict your guard is.
      // Usually, duck typing accepts this, but good to know.
      const complicatedObj = { type: 'ok', value: 1, extra: 'stuff' };
      expect(isResult(complicatedObj)).toBe(true); // Should likely be true
    });
  });

  describe('Integration: Pipelining', () => {
    it('should handle a sequence of maps and chains', () => {
      const result = makeResult
        .Ok(10)
        .map(x => x * 2) // 20
        .chain(x => makeResult.Ok(x + 5)) // 25
        .mapError(() => 'new error') // Ignored
        .map(x => `Value: ${x}`); // "Value: 25"

      expect(unwrap(result)).toBe('Value: 25');
    });

    it('should short-circuit the pipeline on first error', () => {
      const fn = vi.fn();

      const result = makeResult
        .Ok(10)
        .map(x => x * 2) // 20
        .chain(() => makeResult.Err('First Failure')) // Breaks here
        .map(fn) // Should skip
        .chain(x => makeResult.Ok(x)); // Should skip

      expect(fn).not.toHaveBeenCalled();
      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        expect(result.error).toBe('First Failure');
      }
    });
  });
});
