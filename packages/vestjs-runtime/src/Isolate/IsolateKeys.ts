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

export const ExcludedFromDump: Set<string> = new Set([
  IsolateKeys.AbortController,
  IsolateKeys.Parent,
  IsolateKeys.Keys,
]);
