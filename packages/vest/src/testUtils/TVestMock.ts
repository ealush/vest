import { TFieldName, TGroupName } from 'SuiteResultTypes';
import * as vest from 'vest';

type TTestSuiteCallback = (..._args: any[]) => void;
export type TTestSuite = vest.Suite<TFieldName, TGroupName, TTestSuiteCallback>;
