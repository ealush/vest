import * as state from '../../state';
import { KEY_SUITES } from '../../state/constants';

/**
 * @param {string} suiteId.
 * @returns {Object} Suite from state.
 */
const getSuite = suiteId => state.get()[KEY_SUITES][suiteId];

export default getSuite;
