import concatTruthy from './concatTruthy.js';

type Joinable = string | false | null | undefined;

export default function joinTruthy(
  values: Joinable | Array<Joinable | Joinable[]>,
  delimiter: string,
): string {
  const normalized = Array.isArray(values) ? values : [values];

  return concatTruthy<Joinable | Joinable[]>(...normalized)
    .flat()
    .join(delimiter);
}
