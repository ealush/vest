import { isEmpty } from 'isEmpty';
import { isNullish } from 'isNullish';

const regexp = /{(.*?)}/g;

export function text(
  str: string,
  ...substitutions: Array<Record<string, unknown> | unknown>
): string {
  const first = substitutions[0];

  if (typeof first === 'object' && !isNullish(first)) {
    return str.replace(regexp, (placeholder, key: string) => {
      return `${(first as Record<string, unknown>)[key] ?? placeholder}`;
    });
  }

  const subs = [...substitutions];

  return str.replace(regexp, placeholder => {
    return `${isEmpty(subs) ? placeholder : subs.shift()}`;
  });
}
