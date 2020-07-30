import * as state from '../../src/core/state';
import { KEY_SUITES } from '../../src/core/state/constants';

const suiteIdByName = suiteName => {
  const suites = state.get()[KEY_SUITES];

  if (!suites) {
    return null;
  }

  for (const key in suites) {
    if (!Array.isArray(suites[key])) {
      continue;
    }
    const [current] = suites[key];

    if (current.name === suiteName) {
      return key;
    }
  }

  return null;
};

export default suiteIdByName;
