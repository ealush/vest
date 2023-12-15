import { ErrorStrings } from 'ErrorStrings';
import {
  Nullable,
  hasOwnProperty,
  invariant,
  isNullish,
  isStringValue,
  text,
} from 'vest-utils';
import { expandObject, minifyObject } from 'vest-utils/minifyObject';

import { TIsolate } from 'Isolate';
import { ExcludedFromDump, IsolateKeys } from 'IsolateKeys';
import { IsolateMutator } from 'IsolateMutator';

export class IsolateSerializer {
  // eslint-disable-next-line max-statements, complexity, max-lines-per-function
  static deserialize(node: Record<string, any> | TIsolate | string): TIsolate {
    // Validate the root object
    const root = (
      isStringValue(node) ? JSON.parse(node) : ({ ...node } as TIsolate)
    ) as [any, any];

    const expanded = expandObject(...root);

    IsolateSerializer.validateIsolate(expanded);

    const queue = [expanded];

    // Iterate over the queue until it's empty
    while (queue.length) {
      // Get the next item from the queue
      const current = queue.shift();

      if (!current) {
        continue;
      }

      const children = current.children;

      // If there are no children, nothing to do.
      if (!children) {
        continue;
      }

      // Copy the children and set their parent to the current node.
      current.children = children.map(child => {
        const nextChild = { ...child };

        IsolateMutator.setParent(nextChild, current);
        queue.push(nextChild);

        // If the child has a key, add it to the parent's keys.
        const key = nextChild.key;

        if (key) {
          current.keys = current.keys ?? {};
          current.keys[key] = nextChild;
        }

        return nextChild;
      });
    }

    return expanded;
  }

  static serialize(isolate: Nullable<TIsolate>): string {
    if (isNullish(isolate)) {
      return '';
    }

    const minified = minifyObject(isolate, ExcludedFromDump);

    return JSON.stringify(minified);
  }

  static validateIsolate(
    node: Record<string, any> | TIsolate,
  ): asserts node is TIsolate {
    invariant(
      hasOwnProperty(node, IsolateKeys.Type),
      text(ErrorStrings.INVALID_ISOLATE_CANNOT_PARSE),
    );
  }
}
