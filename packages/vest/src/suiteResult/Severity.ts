export enum Severity {
  WARNINGS = 'warnings',
  ERRORS = 'errors',
  SUCCESSES = 'successes',
  INFO = 'info',
}

export enum SeverityCount {
  ERROR_COUNT = 'errorCount',
  WARN_COUNT = 'warnCount',
  SUCCESS_COUNT = 'successCount',
  INFO_COUNT = 'infoCount',
}

export function countKeyBySeverity(severity: Severity): SeverityCount {
  switch (severity) {
    case Severity.ERRORS:
      return SeverityCount.ERROR_COUNT;
    case Severity.WARNINGS:
      return SeverityCount.WARN_COUNT;
    case Severity.SUCCESSES:
      return SeverityCount.SUCCESS_COUNT;
    case Severity.INFO:
      return SeverityCount.INFO_COUNT;
  }
}

export enum TestSeverity {
  Error = 'error',
  Warning = 'warning',
  Success = 'success',
  Info = 'info',
}
