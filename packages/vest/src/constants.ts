import { VEST_RUNTIME_VERSION } from 'vestjs-runtime';

export const VEST_VERSION =
  typeof VEST_RUNTIME_VERSION === 'string' ? VEST_RUNTIME_VERSION : 'dev';
