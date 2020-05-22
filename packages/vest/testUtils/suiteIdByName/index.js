import { getState } from '../../src/core/state';
import { SYMBOL_SUITES } from '../../src/core/state/symbols';

const suiteIdByName = suiteName => {
  const suites = getState(SYMBOL_SUITES);

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
