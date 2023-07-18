export enum ErrorStrings {
  NO_ACTIVE_ISOLATE = 'Not within an active isolate',
  UNABLE_TO_PICK_NEXT_ISOLATE = 'Unable to pick next isolate. This is a bug, please report it to the Vest maintainers.',
  ENCOUNTERED_THE_SAME_KEY_TWICE = `Encountered the same key "{key}" twice. This may lead to inconsistent or overriding of results.`,
  IVALID_ISOLATE_CANNOT_PARSE = `Invalid isolate was passed to IsolateParser. Cannot proceed.`,
}
