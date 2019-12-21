import { singleton, throwError } from '../../lib';
import { ERROR_HOOK_CALLED_OUTSIDE } from '../constants';

/**
 * @returns {Object} Current output object.
 */
const draft = () => {

    const ctx = singleton.useContext();

    if (ctx) {
        return ctx.result.output;
    }

    throwError('draft ' + ERROR_HOOK_CALLED_OUTSIDE);
};

export default draft;
