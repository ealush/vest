import useTestCallbacks from '../../src/core/produce/useTestCallbacks';
import state from '../../src/core/state';
import useSuiteId from '../../src/core/suite/useSuiteId';
import usePending from '../../src/core/test/lib/pending/usePending';
import useTestObjects from '../../src/core/test/useTestObjects';

export default () =>
  state.createRef({
    usePending,
    useSuiteId: [useSuiteId, [1000, 'suite_name']],
    useTestCallbacks,
    useTestObjects,
  });
