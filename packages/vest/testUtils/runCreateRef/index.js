import state from '../../src/core/state';
import usePending from '../../src/core/state/usePending';
import useSuiteId from '../../src/core/state/useSuiteId';
import useTestCallbacks from '../../src/core/state/useTestCallbacks';
import useTestObjects from '../../src/core/state/useTestObjects';

export default () =>
  state.createRef({
    usePending,
    useSuiteId: [useSuiteId, [1000, 'suite_name']],
    useTestCallbacks,
    useTestObjects,
  });
