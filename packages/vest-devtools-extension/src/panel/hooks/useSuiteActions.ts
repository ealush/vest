import { useCallback } from 'react';

import type { DevtoolsCommand } from '../types';
import { parseJson } from '../domain/formatters';

type SendCommand = (command: DevtoolsCommand) => void;

export function useSuiteActions(sendCommand: SendCommand) {
  const runSuite = useCallback(
    (
      suiteId: string,
      input?: unknown,
      mode?: 'run' | 'runStatic' | 'validate',
    ) => {
      sendCommand({ type: 'RUN_SUITE', suiteId, input, mode });
    },
    [sendCommand],
  );

  const runSuiteFromJson = useCallback(
    (suiteId: string, inputJson: string) => {
      const parsed = parseJson(inputJson);
      if (parsed.error) {
        return parsed;
      }
      sendCommand({ type: 'RUN_SUITE', suiteId, input: parsed.value });
      return parsed;
    },
    [sendCommand],
  );

  return { runSuite, runSuiteFromJson };
}
