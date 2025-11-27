import { makeResult, Result } from './Result';

export function toNumber(value: any): Result<number, string> {
  const num = Number(value);

  if (Number.isNaN(num)) {
    return makeResult.Err(`Value "${value}" is not a number`);
  }

  return makeResult.Ok(num);
}
