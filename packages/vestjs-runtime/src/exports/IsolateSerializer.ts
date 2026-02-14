import {
  Nullable,
  hasOwnProperty,
  isNullish,
  isStringValue,
  isFailure,
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

export class IsolateSerializer {
  static safeDeserialize(
    node: Record<string, any> | TIsolate | string,
  ): Result<TIsolate, Error> {
    try {
      const expanded = expandNode(node);
      if (isFailure(IsolateSerializer.validateIsolate(expanded))) {
        return makeResult.Err(
          new Error(ErrorStrings.INVALID_ISOLATE_CANNOT_PARSE),
        );
      }
      return makeResult.Ok(hydrateIsolate(expanded));
    } catch (error) {
      return makeResult.Err(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  static deserialize(node: Record<string, any> | TIsolate | string): TIsolate {
    const result = IsolateSerializer.safeDeserialize(node);
    return result.unwrap();
  }

  static serialize(
    isolate: Nullable<TIsolate>,
    replacer?: (value: any, key: string) => any,
  ): string {
    if (isNullish(isolate)) {
      return '';
    }

    const minified = minifyObject(isolate, (value: any, key: string) => {
      if (ExcludedFromDump.has(key as any)) {
        return undefined;
      }

      // Drop transient nodes — returning undefined causes
      // minifyObject to skip the entry entirely.
      // Transient nodes are not part of the persistent state
      // and should not be serialized.
      if (value?.transient) {
        return undefined;
      }

      if (replacer) {
        return replacer(value, key);
      }
      return value;
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
    queue.push(nextChild);

    if (nextChild.key) {
      current.keys = current.keys ?? {};
      current.keys[nextChild.key] = nextChild;
    }

    return nextChild;
  });
}

function hydrateIsolate(root: TIsolate): TIsolate {
  const queue = [root];

  while (queue.length) {
    const current = queue.shift();
    if (current) {
      processChildren(current, queue);
    }
  }

  return root;
}

function expandNode(node: Record<string, any> | TIsolate | string): TIsolate {
  const parsed = isStringValue(node)
    ? JSON.parse(node, safeReviver)
    : ({ ...node } as TIsolate);
  const root = Array.isArray(parsed) ? parsed : [parsed, {}];
  const expanded = expandObject(root[0], root[1]);
  return expanded as TIsolate;
}

function safeReviver(key: string, value: any): any {
  if (isUnsafeKey(key)) {
    return;
  }
  return value;
}
