import { throwError } from '../../lib';
import Context from '../Context';
import { runAsync } from '../test';
import suiteResult from '../suiteResult';
import { SUITE_INIT_ERROR } from './constants';

/**
 * Initializes a validation suite, creates a validation context.
 * @param {String} name     Descriptive name for validation suite.
 * @param {Function} tests  Validation suite body.
 * @returns {Object} Vest output object.
 */
const validate = (name, tests) => {
    if (typeof name !== 'string') {
        return throwError(SUITE_INIT_ERROR + ' Expected name to be a string.', TypeError);
    }

    if (typeof tests !== 'function') {
        return throwError(SUITE_INIT_ERROR + ' Expected tests to be a function.', TypeError);
    }

    const result = suiteResult(name);

    new Context({ result });

    tests();

    Context.clear();

    [...result.pending].forEach(runAsync);

    return result.output;
};

export default validate;
