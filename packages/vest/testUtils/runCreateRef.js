import state from 'state';
import usePending from 'usePending';
import useSuiteId from 'useSuiteId';
import useTestCallbacks from 'useTestCallbacks';
import useTestObjects from 'useTestObjects';

export default () =>
  state.createRef({
    usePending,
    useSuiteId: [useSuiteId, [1000, 'suite_name']],
    useTestCallbacks,
    useTestObjects,
  });
