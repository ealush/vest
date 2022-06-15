import { BailGuard } from 'MBailGuard';

describe('BailGuard', () => {
  it('Should take a function', () => {
    expect(() => BailGuard(() => {})).not.toThrow();
  });

  it('Should return a function', () => {
    const fn = () => {};
    const guarded = BailGuard(fn);

    expect(typeof guarded).toBe('function');
  });

  describe('When bail is a function', () => {
    it('Should pass bail all function arguments', () => {
      const bail = jest.fn();
      const fn = jest.fn();
      const guarded = BailGuard(fn).Guard(false).Bail(bail);
      guarded(1, 2, 3);
      expect(bail).toHaveBeenCalledWith(1, 2, 3);
    });
  });

  describe('When calling wrapped function', () => {
    describe('When guard not applied', () => {
      it('Should call original function', () => {
        const cb = jest.fn(() => 'hi!');
        expect(BailGuard(cb)()).toBe('hi!');
        expect(cb).toHaveBeenCalled();
      });

      it('Should pass all arguments to the original function', () => {
        const cb = jest.fn();
        BailGuard(cb)(1, 2, 3);
        expect(cb).toHaveBeenCalledWith(1, 2, 3);
      });
    });

    describe('When calling guarded function', () => {
      describe('When guard not applied', () => {
        it.each([1, '1', null, undefined, {}, [], NaN, true])(
          'Should call original function',
          v => {
            const cb = jest.fn(() => 'hi!');
            const guarded = BailGuard(cb).Guard(() => v);
            guarded();
            expect(cb).toHaveBeenCalled();
          }
        );

        it('Should call original function', () => {
          const cb = jest.fn(() => 'hi!');
          const guarded = BailGuard(cb).Guard(true);
          guarded();
          expect(cb).toHaveBeenCalled();
        });

        describe('When calling Bail', () => {
          it('Should call original function', () => {
            const cb = jest.fn(() => 'hi!');
            const bail = jest.fn();
            const guarded = BailGuard(cb).Guard(true).Bail(bail);
            guarded();
            expect(cb).toHaveBeenCalled();
          });

          it('Should return the original function return value', () => {
            const cb = () => 'hi!';
            const guarded = BailGuard(cb)
              .Guard(true)
              .Bail(() => 'bye!');
            expect(guarded()).toBe('hi!');
          });
        });
      });

      it('Should pass all arguments to the guard callback', () => {
        const cb = jest.fn();
        const guard = jest.fn(() => true);
        const guarded = BailGuard(cb).Guard(guard);
        guarded(1, 2, 3);
        expect(guard).toHaveBeenCalledWith(1, 2, 3);
      });

      describe('When guard applied', () => {
        it('Should prevent calling the original function', () => {
          const cb = jest.fn(() => 'hi!');
          const guarded = BailGuard(cb).Guard(false);
          guarded();
          expect(cb).not.toHaveBeenCalled();
        });
        it('Should prevent calling the original function', () => {
          const cb = jest.fn(() => 'hi!');
          const guarded = BailGuard(cb).Guard(() => false);
          guarded();
          expect(cb).not.toHaveBeenCalled();
        });
      });

      describe('When calling bail', () => {
        it('calling guarded function returns bailed value', () => {
          const cb = jest.fn(() => 'hi!');
          const guarded = BailGuard(cb).Guard(false).Bail('bye!');
          expect(guarded()).toBe('bye!');
        });

        it('Prevents calling the original function', () => {
          const cb = jest.fn(() => 'hi!');
          const guarded = BailGuard(cb).Guard(false).Bail('bye!');
          guarded();
          expect(cb).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe('Guard chaining', () => {
    it('Should allow infinite chaining of guards', () => {
      const cb = jest.fn(() => 'hi!');
      let guarded = BailGuard(cb);

      Array.from({ length: 50 }).forEach(() => {
        guarded = guarded.Guard(true);
      });

      expect(guarded()).toBe('hi!');
    });

    describe('When some guards apply and others do not', () => {
      it('Should prevent calling wrapped function', () => {
        const cb = jest.fn(() => 'hi!');
        const guarded = BailGuard(cb).Guard(true).Guard(false).Guard(true);

        guarded();

        expect(cb).not.toHaveBeenCalled();
      });
    });

    it('Should chain Bail after series of guards', () => {
      const cb = jest.fn(() => 'hi!');
      const bail = jest.fn(() => "I'm a bail");
      const guarded = BailGuard(cb)
        .Guard(true)
        .Guard(false)
        .Guard(false)
        .Bail(bail);

      expect(guarded()).toBe("I'm a bail");
    });

    it('Should call guards in the correct order', () => {
      const cb = jest.fn(() => 'hi!');
      const guard1 = jest.fn(() => true);
      const guard2 = jest.fn(() => true);
      const guard3 = jest.fn(() => true);
      const guarded = BailGuard(cb).Guard(guard1).Guard(guard2).Guard(guard3);
      guarded();

      expect(guard1).toHaveBeenCalledBefore(guard2);
      expect(guard2).toHaveBeenCalledBefore(guard3);
    });
  });
});
