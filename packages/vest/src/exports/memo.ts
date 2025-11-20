import {
  cache,
  CacheApi,
  CB,
  Nullable,
  isNullish,
  invariant,
} from 'vest-utils';
import { TIsolate, IsolateSelectors, Walker } from 'vestjs-runtime';

import { TIsolateTest } from '../core/isolate/IsolateTest/IsolateTest';
import { VestTest } from '../core/isolate/IsolateTest/VestTest';
import {
  createVestIsolate,
  TVestIsolate,
} from '../core/isolate/VestIsolateType';
import { registerReconciler } from '../vest';

const isolateType = 'Memo';

export function memo<Callback extends CB = CB>(
  callback: Callback,
  dependencies: unknown[],
): TIsolateMemo {
  return createVestIsolate(isolateType, callback, {
    dependencies,
    cache: null,
  });
}

class IsolateMemoReconciler {
  static match(currentNode: TIsolate, historyNode: TIsolate): boolean {
    return (
      IsolateSelectors.isIsolateType(currentNode, isolateType) &&
      IsolateSelectors.isIsolateType(historyNode, isolateType)
    );
  }

  static reconcile(current: TIsolateMemo, history: TIsolateMemo): TIsolateMemo {
    initializeCache(history);

    const hit = history.data.cache.get(current.data.dependencies);
    current.data.cache = history.data.cache;

    if (isNullish(hit)) {
      return handleCacheMiss(current, history);
    }

    const historicHit = hit[1];

    if (isCanceledTest(historicHit)) {
      history.data.cache.invalidate(current.data.dependencies);
      return handleCacheMiss(current, history);
    }

    return historicHit;
  }
}

type TIsolateMemo = TVestIsolate<IsolateMemoPayload>;

type TIsolateMemoWithCache = TIsolateMemo & {
  data: { cache: CacheApi<TIsolateMemo> };
};

type IsolateMemoPayload = {
  dependencies: unknown[];
  cache: Nullable<CacheApi<TIsolateMemo>>;
};

registerReconciler(IsolateMemoReconciler);

function initializeCache(
  history: TIsolateMemo,
): asserts history is TIsolateMemoWithCache {
  if (isNullish(history.data.cache)) {
    history.data.cache = cache<TIsolateMemo>(5);
    history.data.cache(history.data.dependencies, () => history);
  }
  invariant(history.data.cache);
}

function handleCacheMiss(
  current: TIsolateMemo,
  history: TIsolateMemo,
): TIsolateMemo {
  invariant(history.data.cache);
  history.data.cache(current.data.dependencies, () => current);
  return current;
}

function isCanceledTest(historicHit: TIsolateMemo): boolean {
  return Walker.some(
    historicHit,
    i => VestTest.isCanceled(i as TIsolateTest),
    VestTest.is,
  );
}
