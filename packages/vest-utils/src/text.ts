import { isObject } from 'isObject';

import { isEmpty } from 'isEmpty';

const regexp = /{(.*?)}/g;

export function text(str: string, ...substitutions: Array<unknown>): string {
  const first = substitutions[0];

  if (isObject(first)) {
    return str.replace(regexp, (placeholder, key: string) => {
      return `${first[key] ?? placeholder}`;
    });
  }

  const subs = [...substitutions];

  return str.replace(regexp, placeholder => {
    return `${isEmpty(subs) ? placeholder : subs.shift()}`;
  });
}
