import { IVestResult, DraftResult } from './vestResult';

declare function promisify(
  validatorFn: (...args: any[]) => IVestResult
): Promise<DraftResult>;

export default promisify;
