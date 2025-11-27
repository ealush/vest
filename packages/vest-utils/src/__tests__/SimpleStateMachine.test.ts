import { describe, test, it, expect } from 'vitest';

import { unwrap, isFailure, isSuccess } from '../Result';
import { StateMachine } from '../SimpleStateMachine';

describe('SimpleStateMachine', () => {
  test('sample', () => {
    const machine = StateMachine({
      initial: 'idle',
      states: {
        error: {},
        idle: {
          click: 'loading',
        },
        loading: {
          success: 'success',
          error: 'error',
        },
        success: {},
      },
    });

    expect(machine.getState()).toBe('idle');

    unwrap(machine.transition('click'));

    expect(machine.getState()).toBe('loading');

    unwrap(machine.transition('success'));

    expect(machine.getState()).toBe('success');

    expect(isFailure(machine.transition('click'))).toBe(true);

    expect(machine.getState()).toBe('success');
  });

  test('sample with conditional', () => {
    const machine = StateMachine({
      initial: 'idle',
      states: {
        error: {},
        idle: {
          click: ['loading', () => false],
        },
        loading: {
          success: 'success',
          error: 'error',
        },
        success: {},
      },
    });

    expect(machine.getState()).toBe('idle');

    expect(isFailure(machine.transition('click'))).toBe(true);

    expect(machine.getState()).toBe('idle');

    expect(isFailure(machine.transition('success'))).toBe(true);

    expect(machine.getState()).toBe('idle');

    expect(isFailure(machine.transition('click'))).toBe(true);

    expect(machine.getState()).toBe('idle');
  });

  describe('sample with conditional and payload', () => {
    const machine = StateMachine({
      initial: 'idle',
      states: {
        error: {},
        idle: {
          click: ['loading', (payload: number) => payload > 0],
        },
        loading: {
          success: 'success',
          error: 'error',
        },
        success: {},
      },
    });

    test('should not transition if payload is falsy', () => {
      expect(machine.getState()).toBe('idle');

      expect(isFailure(machine.transition('click', 0))).toBe(true);

      expect(machine.getState()).toBe('idle');
    });

    test('should transition if payload is truthy', () => {
      expect(machine.getState()).toBe('idle');

      unwrap(machine.transition('click', 1));

      expect(machine.getState()).toBe('loading');
    });
  });

  describe('invalid transitions', () => {
    test('should not transition if action is invalid', () => {
      const machine = StateMachine({
        initial: 'idle',
        states: {
          error: {},
          idle: {
            click: 'loading',
          },
          loading: {
            success: 'success',
            error: 'error',
          },
          success: {},
        },
      });
      expect(machine.getState()).toBe('idle');

      unwrap(machine.transition('click'));

      expect(machine.getState()).toBe('loading');

      expect(isFailure(machine.transition('click'))).toBe(true);

      expect(machine.getState()).toBe('loading');
    });

    test('should not transition if target state is invalid', () => {
      const machine = StateMachine({
        initial: 'idle',
        states: {
          error: {},
          idle: {
            click: 'loading',
          },
          loading: {
            success: 'success',
            error: 'error',
          },
          success: {},
        },
      });
      expect(machine.getState()).toBe('idle');

      unwrap(machine.transition('click'));

      expect(machine.getState()).toBe('loading');

      // @ts-expect-error - Testing invalid transition
      expect(isFailure(machine.transition('finish'))).toBe(true);

      expect(machine.getState()).toBe('loading');
    });
  });

  describe('Catchall state', () => {
    it('When a valid transition does not exist, should search in the search all state', () => {
      const machine = StateMachine({
        initial: 'idle',
        states: {
          '*': {
            terminate: 'x_x',
          },
          error: {},
          idle: {
            click: 'loading',
          },
          loading: {
            success: 'success',
            error: 'error',
          },
          success: {},
        },
      });
      expect(machine.getState()).toBe('idle');

      unwrap(machine.transition('click'));

      expect(machine.getState()).toBe('loading');

      unwrap(machine.transition('terminate'));

      expect(machine.getState()).toBe('x_x');
    });
  });

  describe('transition output value', () => {
    describe('when transition is valid', () => {
      it('Should return Success', () => {
        const machine = StateMachine({
          initial: 'idle',
          states: {
            error: {},
            idle: {
              click: 'loading',
            },
            loading: {
              success: 'success',
              error: 'error',
            },
            success: {},
          },
        });
        expect(machine.getState()).toBe('idle');

        expect(isSuccess(machine.transition('click'))).toBe(true);
      });
    });

    describe('When transitioning to the same state', () => {
      it('Should return Success if transition is valid', () => {
        const machine = StateMachine({
          initial: 'idle',
          states: {
            idle: {
              click: 'idle',
            },
          },
        });
        expect(machine.getState()).toBe('idle');

        expect(isSuccess(machine.transition('click'))).toBe(true);
        expect(machine.getState()).toBe('idle');
      });
    });

    describe('When target state does not exist', () => {
      it('Should return Failure', () => {
        const machine = StateMachine({
          initial: 'idle',
          states: {
            error: {},
            idle: {
              click: 'loading',
            },
            loading: {
              success: 'success',
              error: 'error',
            },
            success: {},
          },
        });
        expect(machine.getState()).toBe('idle');

        unwrap(machine.transition('click'));
        // @ts-expect-error - Testing invalid transition
        expect(isFailure(machine.transition('finish'))).toBe(true);
      });
    });

    describe('When transition is invalid', () => {
      it('Should return Failure', () => {
        const machine = StateMachine({
          initial: 'idle',
          states: {
            error: {},
            idle: {
              click: 'loading',
            },
            loading: {
              success: 'success',
              error: 'error',
            },
            success: {},
          },
        });
        expect(machine.getState()).toBe('idle');

        unwrap(machine.transition('click'));
        expect(isFailure(machine.transition('click'))).toBe(true);
      });
    });

    describe('When the transition is disallowed by a conditional', () => {
      it('Should return Failure', () => {
        const machine = StateMachine({
          initial: 'idle',
          states: {
            error: {},
            idle: {
              click: ['loading', () => false],
            },
            loading: {
              success: 'success',
              error: 'error',
            },
            success: {},
          },
        });
        expect(machine.getState()).toBe('idle');

        expect(isFailure(machine.transition('click'))).toBe(true);
      });
    });
  });

  describe('staticTransition', () => {
    describe('When the transition is valid', () => {
      it('Should return the new state', () => {
        const machine = StateMachine({
          initial: 'idle',
          states: {
            error: {},
            idle: {
              click: 'loading',
            },
            loading: {
              success: 'success',
              error: 'error',
            },
            success: {},
          },
        });
        expect(machine.getState()).toBe('idle');
        expect(machine.staticTransition('idle', 'click')).toBe('loading');
      });

      it('Should not modify the state', () => {
        const machine = StateMachine({
          initial: 'idle',
          states: {
            error: {},
            idle: {
              click: 'loading',
            },
            loading: {
              success: 'success',
              error: 'error',
            },
            success: {},
          },
        });
        expect(machine.getState()).toBe('idle');
        machine.staticTransition('idle', 'click');
        expect(machine.getState()).toBe('idle');
      });
    });

    describe('When the transition is invalid', () => {
      it('Should return the previous state', () => {
        const machine = StateMachine({
          initial: 'idle',
          states: {
            error: {},
            idle: {
              click: 'loading',
            },
            loading: {
              success: 'success',
              error: 'error',
            },
            success: {},
          },
        });
        expect(machine.getState()).toBe('idle');
        // @ts-expect-error - Testing invalid transition
        expect(machine.staticTransition('idle', 'finish')).toBe('idle');
      });
    });

    describe('When the transition is disallowed by a conditional', () => {
      it('Should return the previous state', () => {
        const machine = StateMachine({
          initial: 'idle',
          states: {
            error: {},
            idle: {
              click: ['loading', () => false],
            },
            loading: {
              success: 'success',
              error: 'error',
            },
            success: {},
          },
        });
        expect(machine.getState()).toBe('idle');
        expect(machine.staticTransition('idle', 'click')).toBe('idle');
      });
    });

    describe('When the transition is allowed by a conditional', () => {
      it('Should return the new state', () => {
        const machine = StateMachine({
          initial: 'idle',
          states: {
            error: {},
            idle: {
              click: ['loading', () => true],
            },
            loading: {
              success: 'success',
              error: 'error',
            },
            success: {},
          },
        });
        expect(machine.getState()).toBe('idle');
        expect(machine.staticTransition('idle', 'click')).toBe('loading');
      });
    });
  });

  describe('iniitial', () => {
    it('Should return the initial state', () => {
      const machine = StateMachine({
        initial: 'idle',
        states: {
          error: {},
          idle: {
            click: 'loading',
          },
          loading: {
            success: 'success',
            error: 'error',
          },
          success: {},
        },
      });
      expect(machine.getState()).toBe('idle');
      expect(machine.initial()).toBe('idle');
    });
  });
});
