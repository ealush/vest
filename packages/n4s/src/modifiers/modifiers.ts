import partial from 'partial';

export default function modifiers() {
  return { partial };
}

export type TModifiers = ReturnType<typeof modifiers>;
