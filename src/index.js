import enforce from 'n4s/dist/enforce.min';
import any from 'anyone/any';
import validate from './core/validate';
import { draft, only, skip, warn } from './hooks';
import test from './core/test';
import { singleton } from './lib';
import { VERSION } from './constants';

export default singleton.register({
    Enforce: enforce.Enforce,
    VERSION,
    enforce,
    draft,
    test,
    any,
    validate,
    only,
    skip,
    warn,
});
