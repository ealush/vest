/**
 * Module: `src/Isolate/IsolateKeys.ts`.
 *
 * Provides `IsolateKeys`-related runtime and type utilities used by `vestjs-runtime`.
 */
export enum IsolateKeys {
  Type = '$type',
  Keys = 'keys',
  Key = 'key',
  Parent = 'parent',
  Data = 'data',
  AllowReorder = 'allowReorder',
  Transient = 'transient',
  Status = 'status',
  AbortController = 'abortController',
  Children = 'children',
}

export const ExcludedFromDump = new Set([
  IsolateKeys.AbortController,
  IsolateKeys.Parent,
  IsolateKeys.Keys,
]);
