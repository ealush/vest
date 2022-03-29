import invariant from 'invariant';

export enum Severity {
  WARNINGS = 'warnings',
  ERRORS = 'errors',
}

export enum SeverityCount {
  ERROR_COUNT = 'errorCount',
  WARN_COUNT = 'warnCount',
}

export function countKeyBySeverity(severity: Severity): SeverityCount {
  switch (severity) {
    case Severity.ERRORS:
      return SeverityCount.ERROR_COUNT;
    case Severity.WARNINGS:
      return SeverityCount.WARN_COUNT;
    default:
      invariant(false);
  }
}
