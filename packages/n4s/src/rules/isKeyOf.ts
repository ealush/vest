import bindNot from 'bindNot';

export function isKeyOf(key: string | symbol | number, obj: any): boolean {
  return key in obj;
}

export const isNotKeyOf = bindNot(isKeyOf);
