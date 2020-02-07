import { TestObject } from './lib';
export declare const runAsync: (testObject: TestObject) => void;
declare const test: (fieldName: string, ...args: [string, Function] | [Function]) => TestObject;
export default test;
