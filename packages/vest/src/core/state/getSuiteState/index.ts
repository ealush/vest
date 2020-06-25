import { getSuite } from '..';

/**
 * Retrieves most recent suite state.
 */
const getSuiteState = (suiteId: string): ISuiteState => getSuite(suiteId)[0];

export default getSuiteState;
