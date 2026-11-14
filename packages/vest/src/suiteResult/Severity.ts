export enum Severity {
  WARNINGS = 'warnings',
  ERRORS = 'errors',
  SUCCESS = 'success',
}

export enum SeverityCount {
  ERROR_COUNT = 'errorCount',
  WARN_COUNT = 'warnCount',
  SUCCESS_COUNT = 'successCount',
}

export function countKeyBySeverity(severity: Severity): SeverityCount {
  switch (severity) {
    case Severity.ERRORS:
      return SeverityCount.ERROR_COUNT;
    case Severity.WARNINGS:
      return SeverityCount.WARN_COUNT;
    case Severity.SUCCESS:
      return SeverityCount.SUCCESS_COUNT;
  }
}

export enum TestSeverity {
  Error = 'error',
  Warning = 'warning',
  Success = 'success',
}
