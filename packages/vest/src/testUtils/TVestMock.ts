import { TFieldName, TGroupName } from '@/suiteResult/SuiteResultTypes';
import * as vest from '@/vest';

export type TVestMock = typeof vest;

export type TTestSuiteCallback = (...args: any[]) => void;
export type TTestSuite = vest.Suite<TFieldName, TGroupName, TTestSuiteCallback>;
