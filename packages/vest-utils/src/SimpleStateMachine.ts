import { isFailure, makeResult, Result } from './Result';
import { CB } from './utilityTypes';

const STATE_WILD_CARD = '*';
type TStateWildCard = typeof STATE_WILD_CARD;

type TransitionTarget<S extends string> = S | [S, CB<boolean, [payload?: any]>];
type StatesMap<S extends string = string, A extends string = string> = Record<
  S | TStateWildCard,
  Partial<Record<A, TransitionTarget<S>>>
>;

export type TStateMachine<
  S extends string = string,
  A extends string = string,
> = {
  initial: S;
  states: Partial<StatesMap<S, A>>;
};

export type TStateMachineApi<
  S extends string = string,
  A extends string = string,
> = {
  getState: CB<S>;
  initial: CB<S>;
  staticTransition: (from: S, action: A, payload?: any) => S;
  transition: (action: A, payload?: any) => Result<void, string>;
};

type TransitionValue<V> = V extends [infer T, any]
  ? T extends string
    ? T
    : never
  : V extends string
    ? V
    : never;

type Values<T> = T[keyof T];

type StateConfigs<M extends { states: Record<string, any> }> = Values<
  M['states']
>;

type ActionFromConfig<M extends { states: Record<string, any> }> =
  StateConfigs<M> extends infer SC
    ? SC extends any
      ? Extract<keyof SC, string>
      : never
    : never;

type TargetStatesFromConfig<M extends { states: Record<string, any> }> =
  StateConfigs<M> extends infer SC
    ? SC extends any
      ? TransitionValue<Values<SC>>
      : never
    : never;

type StateFromConfig<
  M extends { initial: string; states: Record<string, any> },
> =
  | M['initial']
  | Extract<keyof M['states'], string>
  | TargetStatesFromConfig<M>;

export function StateMachine<
  M extends { initial: string; states: Record<string, any> },
>(machine: M): TStateMachineApi<StateFromConfig<M>, ActionFromConfig<M>> {
  type SMState = StateFromConfig<M>;
  type SMAction = ActionFromConfig<M>;

  const typedMachine = machine as TStateMachine<SMState, SMAction>;

  let state = typedMachine.initial;

  const api = { getState, initial, staticTransition, transition };

  return api;

  function getState(): SMState {
    return state;
  }

  function initial(): SMState {
    return machine.initial;
  }

  function transition(action: SMAction, payload?: any): Result<void, string> {
    const result = calculateNextState(typedMachine, state, action, payload);

    if (isFailure(result)) {
      return makeResult.Err(result.error);
    }

    state = result.value;
    return makeResult.Ok(undefined);
  }

  function staticTransition(
    from: SMState,
    action: SMAction,
    payload?: any,
  ): SMState {
    const transitionTo = getTransitionTarget(typedMachine, from, action);
    const target = Array.isArray(transitionTo)
      ? evaluateConditionalTarget(transitionTo, from, payload)
      : transitionTo;

    return !target || target === from ? from : (target as SMState);
  }
}

function getTransitionTarget<S extends string, A extends string>(
  machine: TStateMachine<S, A>,
  from: S,
  action: A,
): TransitionTarget<S> | undefined {
  return (
    machine.states[from]?.[action] ?? machine.states[STATE_WILD_CARD]?.[action]
  );
}

function evaluateConditionalTarget<S extends string>(
  target: [S, CB<boolean, [payload?: any]>],
  from: S,
  payload?: any,
): S {
  const [nextState, conditional] = target;
  return conditional(payload) ? nextState : from;
}

function calculateNextState<S extends string, A extends string>(
  machine: TStateMachine<S, A>,
  from: S,
  action: A,
  payload?: any,
): Result<S, string> {
  const transitionTo = getTransitionTarget(machine, from, action);

  if (!transitionTo) {
    return makeResult.Err(
      `Invalid transition: "${action}" from state "${from}"`,
    );
  }

  if (Array.isArray(transitionTo)) {
    const [candidateState, conditional] = transitionTo;
    if (!conditional(payload)) {
      return makeResult.Err(
        `Invalid transition: "${action}" from state "${from}" (conditional failed)`,
      );
    }
    return makeResult.Ok(candidateState);
  }

  return makeResult.Ok(transitionTo as S);
}
