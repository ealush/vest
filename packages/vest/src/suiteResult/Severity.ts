export enum Severity {
  WARNINGS = 'warnings',
  ERRORS = 'errors',
}

export enum SeverityCount {
  ERROR_COUNT = 'errorCount',
  WARN_COUNT = 'warnCount',
}

export function countKeyBySeverity(severity: Severity): SeverityCount {
  return severity === Severity.ERRORS
    ? SeverityCount.ERROR_COUNT
    : SeverityCount.WARN_COUNT;
}

export enum TestSeverity {
  Error = 'error',
  Warning = 'warning',
}
