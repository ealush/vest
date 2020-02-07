import { singleton, throwError } from '../../lib';
import { ERROR_HOOK_CALLED_OUTSIDE } from '../constants';
import {VestOutput} from '../../core/suiteResult';

/**
 * @returns {Object} Current output object.
 */
const draft = (): VestOutput => {

    const ctx = singleton.useContext();

    if (ctx) {
        return ctx.result.output;
    }

    throwError('draft ' + ERROR_HOOK_CALLED_OUTSIDE);
};

export default draft;
