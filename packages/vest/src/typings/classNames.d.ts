import { IVestResult } from './vest';

declare function classNames(
  res: Partial<IVestResult>,
  classes?: {
    valid?: string;
    tested?: string;
    invalid?: string;
    warning?: string;
    untested?: string;
  }
): (fieldName: string) => string;

export default classNames;
