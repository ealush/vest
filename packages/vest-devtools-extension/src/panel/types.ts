export type VestEventPayload = {
  suiteId: string;
  suiteName: string;
  eventName: string;
  timestamp: number;
  payload: unknown;
  lastRunArgs: unknown[];
  state: SuiteSnapshot;
};

export type SuiteSnapshot = {
  valid: boolean | null;
  errorCount: number;
  warnCount: number;
  pendingCount: number;
  testCount: number;
  fields: FieldSnapshot[];
  focus: SuiteFocus;
};

export type FieldSnapshot = {
  name: string;
  status: 'passing' | 'failing' | 'pending' | 'warning' | 'idle';
  errorCount: number;
  warnCount: number;
  pendingCount: number;
  testCount: number;
  errors: unknown[];
  warnings: unknown[];
  valid: boolean | null;
};

export type SuiteFocus = {
  mode: 'only' | 'skip' | null;
  matchAll: boolean;
  match: string[];
};

export type DevtoolsCommand =
  | {
      type: 'RUN_SUITE';
      suiteId: string;
      input?: unknown;
      mode?: 'run' | 'runStatic' | 'validate';
    }
  | {
      type: 'SET_INPUT';
      suiteId: string;
      input?: unknown;
    };
