import { enforceEager } from 'eager';
import { enforceLazy } from 'lazy';

export const enforce = Object.assign(enforceEager, enforceLazy);
