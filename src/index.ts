import enforce from 'n4s/dist/enforce.min';
import any from 'anyone/any';
import validate from './core/validate';
import { draft, only, skip, warn } from './hooks';
import test from './core/test';
import { singleton } from './lib';
import { VERSION } from './constants';
import { Vest } from './types';

const Enforce = enforce.Enforce;

const vest: Vest = {
    VERSION,
    enforce,
    draft,
    Enforce,
    test,
    any,
    validate,
    only,
    skip,
    warn
};

export {
    VERSION,
    enforce,
    draft,
    Enforce,
    test,
    any,
    validate,
    only,
    skip,
    warn
};

export default singleton.register(vest);
