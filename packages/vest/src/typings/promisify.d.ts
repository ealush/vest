import { IVestResult, DraftResult } from './vestResult';

declare function promisify(
  validatorFn: (...args: any[]) => IVestResult
): (...args: any[]) => Promise<DraftResult>;

export default promisify;
