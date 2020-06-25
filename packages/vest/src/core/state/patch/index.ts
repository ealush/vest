import { getSuite } from '..';

type PatcherType = (
  currentState: ISuiteState,
  prevState: ISuiteState
) => ISuiteState;

/**
 * Updates current suite state with patcher value or output.
 */
const patch = (suiteId: string, patcher: PatcherType): ISuiteState => {
  const [state, prevState] = getSuite(suiteId) ?? [];

  const nextState = patcher(state, prevState);

  if (nextState === state) {
    return state;
  }

  getSuite(suiteId)[0] = nextState;
  return nextState;
};

export default patch;
