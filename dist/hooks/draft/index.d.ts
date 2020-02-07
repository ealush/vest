declare const draft: () => {
    name: string;
    errorCount: number;
    warnCount: number;
    testCount: number;
    tests: {};
    skipped: any[];
    tested: any[];
    canceled: boolean;
};
export default draft;
