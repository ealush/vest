import { isEmpty } from 'isEmpty';

const regexp = /{(.*?)}/g;

export function text(
  str: string,
  ...substitutions: Array<Record<string, StringableValue> | StringableValue>
): string {
  const first = substitutions[0];

  if (typeof first === 'object') {
    return str.replace(regexp, (placeholder, key) => {
      return (first[key] ?? placeholder) as string;
    });
  }

  const subs = [...substitutions];

  return str.replace(regexp, placeholder => {
    return (isEmpty(subs) ? placeholder : subs.shift()) as string;
  });
}

type StringableValue = number | string;
