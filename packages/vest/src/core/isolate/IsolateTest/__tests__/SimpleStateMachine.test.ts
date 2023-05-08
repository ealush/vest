import { StateMachine } from 'SimpleStateMachine';

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

      // @ts-expect-error - intentionally invalid transition
      machine.transition('finish');

      expect(machine.getState()).toBe('loading');
    });
  });
});
