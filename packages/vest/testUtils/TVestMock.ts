import * as vest from 'vest';

export type TVestMock = typeof vest;

export type TTestSuite = vest.Suite<(...args: any[]) => void, string>;
