/**
 * Module: `src/testUtils/TVestMock.ts`.
 *
 * Provides `TVestMock`-related runtime and type utilities used by `vest`.
 */
import { TFieldName, TGroupName } from '../suiteResult/SuiteResultTypes';
import * as vest from '../vest';

type TTestSuiteCallback = (..._args: any[]) => void;
export type TTestSuite = vest.Suite<TFieldName, TGroupName, TTestSuiteCallback>;
