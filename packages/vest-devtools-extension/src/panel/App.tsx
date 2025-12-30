/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useMemo, useState } from 'react';

import { FieldPanel } from './components/FieldPanel';
import { HeaderBar } from './components/HeaderBar';
import { HistoryDrawer } from './components/HistoryDrawer';
import { SuiteHeader } from './components/SuiteHeader';
import { SuiteInputPanel } from './components/SuiteInputPanel';
import { THEME } from './constants';
import { parseJson } from './domain/formatters';
import { getInputFromArgs } from './domain/suite';
import { useDevtoolsPort } from './hooks/useDevtoolsPort';
import { useEventHistory } from './hooks/useEventHistory';
import { useSuiteActions } from './hooks/useSuiteActions';
import { useDevtoolsStore } from './store';

export function App() {
  const { events, selectedEvent, selectedEventId, addEvent, selectEvent } =
    useEventHistory();
  const { connected, sendCommand } = useDevtoolsPort(addEvent);
  const { runSuite } = useSuiteActions(sendCommand);
  const historyOpen = useDevtoolsStore(state => state.historyOpen);
  const setHistoryOpen = useDevtoolsStore(state => state.setHistoryOpen);
  const fieldFilter = useDevtoolsStore(state => state.fieldFilter);
  const setFieldFilter = useDevtoolsStore(state => state.setFieldFilter);
  const manualInputs = useDevtoolsStore(state => state.manualInputs);
  const setManualInput = useDevtoolsStore(state => state.setManualInput);
  const [manualInputError, setManualInputError] = useState<string | null>(null);

  const activeSuiteId = selectedEvent?.suiteId ?? events[0]?.suiteId ?? null;
  const snapshot = selectedEvent?.state;

  const inputData = useMemo(() => {
    if (!selectedEvent) {
      return {};
    }
    return getInputFromArgs(selectedEvent.lastRunArgs);
  }, [selectedEvent]);

  const manualInput = activeSuiteId ? manualInputs[activeSuiteId] ?? '' : '';

  const handleRunSuite = (payload?: unknown) => {
    if (!activeSuiteId) {
      return;
    }
    runSuite(activeSuiteId, payload);
  };

  const handleApplyInput = () => {
    if (!activeSuiteId) {
      return;
    }
    const parsed = parseJson(manualInput);
    if (parsed.error) {
      setManualInputError(parsed.error.message);
      return;
    }
    setManualInputError(null);
    runSuite(activeSuiteId, parsed.value);
  };

  const handleTriggerValidation = () => {
    if (!activeSuiteId) {
      return;
    }
    if (manualInput.trim().length) {
      const parsed = parseJson(manualInput);
      if (parsed.error) {
        setManualInputError(parsed.error.message);
        return;
      }
      setManualInputError(null);
      runSuite(activeSuiteId, parsed.value);
      return;
    }
    runSuite(activeSuiteId, inputData);
  };

  return (
    <div css={styles.root}>
      <HeaderBar
        connected={connected}
        onToggleHistory={() => setHistoryOpen(!historyOpen)}
        onRunSuite={() => handleRunSuite(inputData)}
        historyOpen={historyOpen}
      />
      <main css={styles.layout}>
        <section css={styles.leftPanel}>
          <FieldPanel
            snapshot={snapshot}
            filter={fieldFilter}
            onFilterChange={setFieldFilter}
          />
        </section>
        <section css={styles.mainPanel}>
          <SuiteHeader event={selectedEvent} />
          <SuiteInputPanel
            inputData={inputData}
            manualInput={manualInput}
            error={manualInputError}
            onManualInputChange={value => {
              if (activeSuiteId) {
                setManualInput(activeSuiteId, value);
                setManualInputError(null);
              }
            }}
            onApplyInput={handleApplyInput}
            onTriggerValidation={handleTriggerValidation}
          />
        </section>
      </main>
      <HistoryDrawer
        open={historyOpen}
        events={events}
        selectedEventId={selectedEventId}
        onSelect={id => {
          selectEvent(id);
          setHistoryOpen(false);
        }}
        onClose={() => setHistoryOpen(false)}
      />
    </div>
  );
}

const styles = {
  root: css`
    color-scheme: light dark;
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
      sans-serif;
    background: ${THEME.background};
    color: ${THEME.textPrimary};
    height: 100vh;
    display: flex;
    flex-direction: column;
    position: relative;
  `,
  layout: css`
    display: grid;
    grid-template-columns: 300px 1fr;
    flex: 1;
    min-height: 0;
  `,
  leftPanel: css`
    padding: 16px;
    border-right: 1px solid ${THEME.panelBorder};
    background: rgba(11, 14, 27, 0.92);
    overflow: auto;
  `,
  mainPanel: css`
    padding: 16px 20px;
    overflow: auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
  `,
};
