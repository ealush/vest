import {
  Nullable,
  hasOwnProperty,
  isNullish,
  isStringValue,
  text,
  makeResult,
  Result,
  isUnsafeKey,
} from 'vest-utils';
import { expandObject, minifyObject } from 'vest-utils/minifyObject';

import { TIsolate } from '../Isolate/Isolate';
import { ExcludedFromDump, IsolateKeys } from '../Isolate/IsolateKeys';
import { IsolateMutator } from '../Isolate/IsolateMutator';
import { ErrorStrings } from '../errors/ErrorStrings';
import * as VestRuntime from '../VestRuntime';

export class IsolateSerializer {
  static safeDeserialize(
    node: Record<string, any> | TIsolate | string,
  ): Result<TIsolate, Error> {
    try {
      const expanded = expandNode(node);
      const queue = [expanded];

      while (queue.length) {
        const current = queue.shift();
        if (current) {
          processChildren(current, queue);
        }
      }

      return makeResult.Ok(expanded);
    } catch (error) {
      return makeResult.Err(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  static deserialize(node: Record<string, any> | TIsolate | string): TIsolate {
    return IsolateSerializer.safeDeserialize(node).unwrap();
  }

  static serialize(
    isolate: Nullable<TIsolate>,
    replacer: (value: any, key: string) => any,
  ): string {
    if (isNullish(isolate)) {
      return '';
    }

    const minified = minifyObject(isolate, (value: any, key: string) => {
      if (ExcludedFromDump.has(key as any)) {
        return undefined;
      }
      return replacer(value, key);
    });

    return JSON.stringify(minified);
  }

  static validateIsolate(
    node: Record<string, any> | TIsolate,
  ): Result<TIsolate, string> {
    return hasOwnProperty(node, IsolateKeys.Type)
      ? makeResult.Ok(node as TIsolate)
      : makeResult.Err(text(ErrorStrings.INVALID_ISOLATE_CANNOT_PARSE));
  }
}

function processChildren(current: TIsolate, queue: TIsolate[]): void {
  const children = current.children;

  if (!children) {
    return;
  }

  current.children = children.map(child => {
    const nextChild = { ...child };

    IsolateMutator.setParent(nextChild, current);
    VestRuntime.useAddWatchedIsolate(nextChild);
    queue.push(nextChild);

    if (nextChild.key) {
      current.keys = current.keys ?? {};
      current.keys[nextChild.key] = nextChild;
    }

    return nextChild;
  });
}

function expandNode(node: Record<string, any> | TIsolate | string): TIsolate {
  const root = (
    isStringValue(node)
      ? JSON.parse(node, safeReviver)
      : ({ ...node } as TIsolate)
  ) as [any, any];

  const expanded = expandObject(...root);
  return IsolateSerializer.validateIsolate(expanded).unwrap();
}

function safeReviver(key: string, value: any): any {
  if (isUnsafeKey(key)) {
    return;
  }
  return value;
}
