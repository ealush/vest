import { singleton } from '../../lib';
import { SuiteResultType } from '../suiteResult';

class Context {

    result?: SuiteResultType;

    exclusive: {
        skip?: { [fieldName: string]: true; };
        only?: { [fieldName: string]: true; };
    };

    currentTest?: {
        warn?: Function;
    };

    static clear() {
        singleton.use().ctx = null;
    }

    constructor(parent) {
        singleton.use().ctx = this;
        Object.assign(this, parent);
    }

    setCurrentTest(testObject) {
        this.currentTest = testObject;
    }

    removeCurrentTest() {
        delete this.currentTest;
    }
}

export default Context;
