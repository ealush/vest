import { CB, Result } from 'vest-utils';
import { IsolateSerializer } from 'vestjs-runtime';

import { TestStatus } from '../core/StateMachines/IsolateTestStateMachine';
import { TIsolateSuite } from '../core/isolate/IsolateSuite/IsolateSuite';
import { Suite } from '../suite/SuiteTypes';
import {
  TFieldName,
  TGroupName,
  TSchema,
} from '../suiteResult/SuiteResultTypes';

type Dumpable = {
  dump: CB<TIsolateSuite>;
};

export class SuiteSerializer {
  static serialize(suite: Dumpable) {
    const dump = stripMessageFromPassingTests(suite.dump());

    return IsolateSerializer.serialize(dump, suiteSerializerReplacer);
  }

  static safeDeserialize(
    serialized: string | TIsolateSuite | Record<string, any>,
  ): Result<TIsolateSuite, Error> {
    return IsolateSerializer.safeDeserialize(serialized).map(
      isolate => isolate as TIsolateSuite,
    );
  }

  static deserialize(
    serialized: string | TIsolateSuite | Record<string, any>,
  ): TIsolateSuite {
    return SuiteSerializer.safeDeserialize(serialized).unwrap();
  }

  static resume<
    F extends TFieldName,
    G extends TGroupName,
    T extends CB,
    S extends TSchema,
  >(
    suite: Suite<F, G, T, S>,
    root: string | TIsolateSuite | Record<string, any>,
  ): void {
    const suiteRoot = SuiteSerializer.deserialize(root);

    suite.resume(suiteRoot);
  }
}

function stripMessageFromPassingTests<T>(node: T): T {
  const visited = new WeakMap<object, any>();

  return strip(node, visited);
}

// eslint-disable-next-line complexity, max-statements
function strip<T>(node: T, visited: WeakMap<object, any>): T {
  if (!node || typeof node !== 'object') {
    return node;
  }

  if (visited.has(node as object)) {
    return visited.get(node as object);
  }

  if (Array.isArray(node)) {
    const arr: any[] = [];
    visited.set(node, arr);

    node.forEach(value => {
      arr.push(strip(value, visited));
    });

    return arr as T;
  }

  const root = node as Record<string, any>;
  const shouldKeepMessage =
    root.testStatus === TestStatus.FAILED ||
    root.testStatus === TestStatus.WARNING;
  const clonedNode: Record<string, any> = {};
  visited.set(node, clonedNode);

  for (const [key, value] of Object.entries(root)) {
    if (!shouldKeepMessage && key === 'message') {
      continue;
    }

    clonedNode[key] = strip(value, visited);
  }

  return clonedNode as T;
}

function suiteSerializerReplacer(value: any, key: string) {
  if (isStatusKey(key)) {
    return getAllowedStatus(value);
  }

  if (DisallowedKeys.has(key)) {
    return undefined;
  }

  return value;
}

function isStatusKey(key: string): boolean {
  return key === 'testStatus';
}

function getAllowedStatus(value: any): any {
  return AllowedStatuses.has(value) ? value : undefined;
}

const AllowedStatuses = new Set([
  TestStatus.FAILED,
  TestStatus.PASSING,
  TestStatus.WARNING,
]);

const DisallowedKeys = new Set([
  'focusMode',
  'match',
  'matchAll',
  'output',
  'severity',
  'tests',
]);
