import { TIsolate } from 'vestjs-runtime';

export abstract class IsolateReconciler {
  static match(currentNode: TIsolate, historyNode: TIsolate): boolean {
    return false;
  }

  static reconcile(currentNode: TIsolate, historyNode: TIsolate): TIsolate {
    return (currentNode ?? historyNode) as TIsolate;
  }
}
