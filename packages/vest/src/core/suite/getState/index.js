import { getSuite } from '../../state';

/**
 * Retrieves most recent suite state.
 * @param {string} suiteId
 * @returns {Object} Current suite state.
 */
const getSuiteState = suiteId => getSuite(suiteId)[0];

export default getSuiteState;
