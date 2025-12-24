import { Nullable } from 'vest-utils';

import { IsolateKeys } from './IsolateKeys';
import { IsolateStatus } from './IsolateStatus';

export type IsolateKey = Nullable<string>;

export type TIsolate<P extends IsolatePayload = IsolatePayload> = {
  [IsolateKeys.AllowReorder]?: boolean;
  [IsolateKeys.Parent]: Nullable<TIsolate>;
  [IsolateKeys.Type]: string;
  [IsolateKeys.Keys]: Nullable<Record<string, TIsolate>>;
  [IsolateKeys.Data]: DataOnly<P>;
  [IsolateKeys.Status]: IsolateStatus;
  [IsolateKeys.AbortController]: Nullable<AbortController>;
  children: Nullable<TIsolate[]>;
  key: IsolateKey;
  output: any;
} & UsedFeaturesOnly<P>;

type DataOnly<P extends IsolatePayload> = Omit<P, keyof IsolateFeatures>;
type UsedFeaturesOnly<P extends IsolatePayload> = Pick<
  P,
  keyof IsolateFeatures
>;

export type IsolatePayload<P = Record<string, any>> = P & IsolateFeatures;
export type IsolateFeatures = {
  [IsolateKeys.AllowReorder]?: boolean;
  [IsolateKeys.Status]?: IsolateStatus;
};
