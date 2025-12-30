/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { THEME } from '../constants';
import { formatTime } from '../domain/formatters';
import type { EventRecord } from '../hooks/useEventHistory';

type HistoryDrawerProps = {
  open: boolean;
  events: EventRecord[];
  selectedEventId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
};

export function HistoryDrawer({
  open,
  events,
  selectedEventId,
  onSelect,
  onClose,
}: HistoryDrawerProps) {
  if (!open) {
    return null;
  }

  return (
    <div css={styles.overlay} role="dialog">
      <div css={styles.drawer}>
        <div css={styles.header}>
          <h2 css={styles.title}>Event History</h2>
          <button type="button" css={styles.closeButton} onClick={onClose}>
            Close
          </button>
        </div>
        <div css={styles.list}>
          {events.map(event => (
            <button
              key={event.id}
              type="button"
              css={styles.item(event.id === selectedEventId)}
              onClick={() => onSelect(event.id)}
            >
              <div css={styles.itemTitle}>{event.eventName}</div>
              <div css={styles.itemMeta}>
                {event.suiteName} · {formatTime(event.timestamp)}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: css`
    position: absolute;
    inset: 0;
    background: rgba(5, 8, 18, 0.72);
    display: flex;
    justify-content: flex-end;
    z-index: 10;
  `,
  drawer: css`
    width: 320px;
    background: ${THEME.panelElevated};
    border-left: 1px solid ${THEME.panelBorder};
    display: flex;
    flex-direction: column;
    padding: 16px;
    gap: 12px;
  `,
  header: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
  `,
  title: css`
    margin: 0;
    font-size: 14px;
    color: ${THEME.textPrimary};
  `,
  closeButton: css`
    border: 1px solid ${THEME.panelBorder};
    background: ${THEME.panel};
    color: ${THEME.textPrimary};
    border-radius: 8px;
    padding: 6px 10px;
    cursor: pointer;
  `,
  list: css`
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: auto;
  `,
  item: (active: boolean) => css`
    text-align: left;
    border-radius: 10px;
    padding: 8px 10px;
    border: 1px solid ${active ? THEME.accent : THEME.panelBorder};
    background: ${active ? 'rgba(99, 102, 241, 0.18)' : THEME.panel};
    color: ${THEME.textPrimary};
    cursor: pointer;
  `,
  itemTitle: css`
    font-weight: 600;
  `,
  itemMeta: css`
    font-size: 11px;
    color: ${THEME.textMuted};
    margin-top: 4px;
  `,
};
