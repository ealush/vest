type TRuleDetailedResult = {
    pass: boolean;
    message?: string;
};
/* eslint-disable max-lines-per-function */
// TODO: This gives me a headache. Instead of `any` we should use `TLazy`
// but it fails when using compose. The type is very complex.
declare function compose(...composites: any[]): ((value: any) => void) & {
    run: (value: any) => TRuleDetailedResult;
    test: (value: any) => boolean;
};
export { compose as default };
