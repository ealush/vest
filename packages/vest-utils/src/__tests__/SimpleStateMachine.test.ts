import { StateMachine } from 'SimpleStateMachine';
import { describe, test, it, expect } from 'vitest';

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

    machine.transition('click');

    expect(machine.getState()).toBe('loading');

    machine.transition('success');

    expect(machine.getState()).toBe('success');

    machine.transition('click');

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

    machine.transition('click');

    expect(machine.getState()).toBe('idle');

    machine.transition('success');

    expect(machine.getState()).toBe('idle');

    machine.transition('click');

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

      machine.transition('click', 0);

      expect(machine.getState()).toBe('idle');
    });

    test('should transition if payload is truthy', () => {
      expect(machine.getState()).toBe('idle');

      machine.transition('click', 1);

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

      machine.transition('click');

      expect(machine.getState()).toBe('loading');

      machine.transition('click');

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

      machine.transition('click');

      expect(machine.getState()).toBe('loading');

      machine.transition('finish');

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

      machine.transition('click');

      expect(machine.getState()).toBe('loading');

      machine.transition('terminate');

      expect(machine.getState()).toBe('x_x');
    });
  });

  describe('transition output value', () => {
    describe('when transition is valid', () => {
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

        expect(machine.transition('click')).toBe('loading');
      });
    });

    describe('When transitioning to the same state', () => {
      it('Should return the same state', () => {
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

        expect(machine.transition('click')).toBe('loading');
        expect(machine.transition('click')).toBe('loading');
      });
    });

    describe('When target state does not exist', () => {
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

        expect(machine.transition('click')).toBe('loading');
        expect(machine.transition('finish')).toBe('loading');
      });
    });

    describe('When transition is invalid', () => {
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

        expect(machine.transition('click')).toBe('loading');
        expect(machine.transition('click')).toBe('loading');
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

        expect(machine.transition('click')).toBe('idle');
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
