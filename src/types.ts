import Context from './core/Context';

export type Vest = {
    VERSION: string;
    enforce: Function;
    draft: Function;
    Enforce: Function;
    test: Function;
    any: (...args: any[]) => boolean;
    validate: (name: string, tests: Function) => void;
    only: (item: string|string[]) => void;
    skip:  (item: string|string[]) => void;
    warn: Function;
    ctx?: Context;
};