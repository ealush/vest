declare type SeverityKey = 'errors' | 'warnings';

declare type GetResultType = string[] | { [fieldName: string]: string[] };

declare type IResultValues = {
  name: string;
  groups: TestDetailsType;
  tests: TestDetailsType;
  errorCount: number;
  warnCount: number;
  testCount: number;
};

declare interface IResult extends IResultValues {
  hasErrors: (fieldName?: string) => boolean;
  hasWarnings: (fieldName?: string) => boolean;
  getErrors: (fieldName?: string) => GetResultType;
  getWarnings: (fieldName?: string) => GetResultType;
  hasErrorsByGroup: (groupName: string, fieldName?: string) => boolean;
  hasWarningsByGroup: (groupName: string, fieldName?: string) => boolean;
  getErrorsByGroup: (fieldName?: string) => GetResultType;
  getWarningsByGroup: (fieldName?: string) => GetResultType;
  done?: (fieldName?: string, cb: (res: IResultDraft) => void) => IResult;
}

declare interface IResultDraft extends Omit<IResult, 'done'> {}
