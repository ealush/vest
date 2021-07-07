type TRuleDetailedResult = {
    pass: boolean;
    message?: string;
};
declare function compose(...composites: any[]): ((value: any) => void) & {
    run: (value: any) => TRuleDetailedResult;
    test: (value: any) => boolean;
};
export { compose as default };
