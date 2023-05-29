export enum ErrorStrings {
  NO_ACTIVE_ISOLATE = 'Not within an active isolate',
  ENCOUNTERED_THE_SAME_KEY_TWICE = `Encountered the same test key "{key}" twice. This may lead to tests overriding each other's results, or to tests being unexpectedly omitted.`,
}
