import getSuite from '../getSuite';

/**
 * Retrieves most recent suite state.
 * @param {string} suiteId
 * @returns {Object} Current suite state.
 */
const getState = suiteId => getSuite(suiteId)[0];

export default getState;
