import { throwError } from '../../lib';
import Context from '../Context';
import { runAsync } from '../test';
import suiteResult, { VestOutput } from '../suiteResult';
import { SUITE_INIT_ERROR } from './constants';

/**
 * Initializes a validation suite, creates a validation context.
 */
const validate = (name: string, tests: Function): VestOutput => {
    if (typeof name !== 'string') {
        //@ts-ignore
        return throwError(SUITE_INIT_ERROR + ' Expected name to be a string.', TypeError);
    }

    if (typeof tests !== 'function') {
        //@ts-ignore
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
