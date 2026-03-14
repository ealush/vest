import {
  cache,
  CacheApi,
  CB,
  Nullable,
  isNullish,
  makeResult,
  Result,
  unwrap,
  CacheConfig,
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

export type MemoOptions = {
  cacheSize?: number;
  ttl?: number;
};

export function memo<Callback extends CB = CB>(
  callback: Callback,
  dependencies: unknown[],
  options?: MemoOptions,
): TIsolateMemo {
  return createVestIsolate(isolateType, callback, {
    dependencies,
    cache: null,
    options,
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
    const historyWithCache = unwrap(initializeCache(history));

    const hit = historyWithCache.data.cache.get(current.data.dependencies);
    current.data.cache = historyWithCache.data.cache;

    if (isNullish(hit)) {
      return handleCacheMiss(current, historyWithCache);
    }

    const historicHit = hit[1];

    if (isCanceledTest(historicHit)) {
      historyWithCache.data.cache.invalidate(current.data.dependencies);
      return handleCacheMiss(current, historyWithCache);
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
  options?: MemoOptions;
};

registerReconciler(IsolateMemoReconciler);

function initializeCache(
  history: TIsolateMemo,
): Result<TIsolateMemoWithCache, string> {
  if (isNullish(history.data.cache)) {
    history.data.cache = cache<TIsolateMemo>(
      getMemoCacheConfig(history.data.options),
    );
    history.data.cache(history.data.dependencies, () => history);
  }

  return isNullish(history.data.cache)
    ? makeResult.Err('Cache initialization failed')
    : makeResult.Ok(history as TIsolateMemoWithCache);
}

function handleCacheMiss(
  current: TIsolateMemo,
  history: TIsolateMemoWithCache,
): TIsolateMemo {
  history.data.cache(current.data.dependencies, () => current);
  return current;
}

function isCanceledTest(historicHit: TIsolateMemo): boolean {
  return Walker.some(
    historicHit,
    i => VestTest.isCanceled(i as TIsolateTest).unwrap(),
    VestTest.is,
  );
}

function getMemoCacheConfig(options?: MemoOptions): CacheConfig {
  return {
    maxSize: options?.cacheSize ?? 5,
    ttl: options?.ttl,
  };
}
