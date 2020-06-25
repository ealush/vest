import produce from '../../core/produce';
import getSuiteState from '../../core/state/getSuiteState';
import throwError from '../../lib/throwError';

const get = (suiteId: string): IResultDraft => {
  if (!suiteId) {
    throwError('`get` hook was called without a suite name.');
  }

  const state = getSuiteState(suiteId);
  return produce(state, { draft: true });
};

export default get;
