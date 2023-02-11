import * as walker from 'walker';

import { useAvailableSuiteRoot } from 'PersistedContext';
import type { Isolate } from 'isolate';

export class SuiteWalker {
  static walk(
    callback: (isolate: Isolate, breakout: () => void) => void,
    visitOnly?: walker.VisitOnlyPredicate
  ): void {
    const root = useAvailableSuiteRoot();

    if (!root) return;

    walker.walk(root, callback, visitOnly);
  }

  static some(
    predicate: (node: Isolate) => boolean,
    visitOnly?: walker.VisitOnlyPredicate
  ): boolean {
    const root = useAvailableSuiteRoot();

    if (!root) return false;
    return walker.some(root, predicate, visitOnly);
  }

  static has(match: walker.VisitOnlyPredicate): boolean {
    const root = useAvailableSuiteRoot();

    if (!root) return false;
    return walker.has(root, match);
  }

  static find(
    predicate: (node: Isolate) => boolean,
    visitOnly?: walker.VisitOnlyPredicate
  ): Isolate | null {
    const root = useAvailableSuiteRoot();

    if (!root) return null;
    return walker.find(root, predicate, visitOnly);
  }

  static every(
    predicate: (node: Isolate) => boolean,
    visitOnly?: walker.VisitOnlyPredicate
  ): boolean {
    const root = useAvailableSuiteRoot();

    if (!root) return false;
    return walker.every(root, predicate, visitOnly);
  }

  static pluck(
    predicate: (node: Isolate) => boolean,
    visitOnly?: walker.VisitOnlyPredicate
  ): void {
    const root = useAvailableSuiteRoot();

    if (!root) return;
    return walker.pluck(root, predicate, visitOnly);
  }
}
