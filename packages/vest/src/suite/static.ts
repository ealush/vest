import { validateSuiteCallback } from 'validateSuiteCallback';
import { CB, assign } from 'vest-utils';

import { IsolateSuite } from 'IsolateSuite';
import { SuiteContext } from 'SuiteContext';
import { SuiteName, SuiteResult, TFieldName } from 'SuiteResultTypes';
import { produceSuiteSummary } from 'produceSuiteSummary';
import { suiteSelectors } from 'suiteSelectors';

type StaticSuite<T extends CB, F extends TFieldName> = (
  ...args: Parameters<T>
) => SuiteResult<F>;

function staticSuite<T extends CB, F extends TFieldName>(
  suiteName: SuiteName,
  suiteCallback: T
): StaticSuite<T, F>;
function staticSuite<T extends CB, F extends TFieldName>(
  suiteCallback: T
): StaticSuite<T, F>;
function staticSuite<T extends CB, F extends TFieldName>(
  ...args: [suiteName: SuiteName, suiteCallback: T] | [suiteCallback: T]
): StaticSuite<T, F> {
  const [suiteCallback, suiteName] = args.reverse() as [T, SuiteName];

  validateSuiteCallback(suiteCallback);

  return suite;

  function suite(...args: Parameters<T>): SuiteResult<F> {
    return SuiteContext.run({}, () => {
      return IsolateSuite.create(runSuiteCallback(...args));
    }).output;
  }

  function runSuiteCallback(...args: Parameters<T>): () => SuiteResult<F> {
    return () => {
      suiteCallback(...args);
      return statisSuiteResult(suiteName);
    };
  }
}

export function statisSuiteResult<F extends TFieldName>(
  suiteName: SuiteName
): SuiteResult<F> {
  const summary = produceSuiteSummary();
  return assign(summary, suiteSelectors(summary), { suiteName });
}

export { staticSuite };
