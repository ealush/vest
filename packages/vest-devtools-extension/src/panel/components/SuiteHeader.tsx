/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { THEME } from '../constants';
import { formatTime } from '../domain/formatters';
import type { EventRecord } from '../hooks/useEventHistory';

type SuiteHeaderProps = {
  event?: EventRecord;
};

export function SuiteHeader({ event }: SuiteHeaderProps) {
  return (
    <div css={styles.root}>
      <div>
        <div css={styles.label}>Active Suite</div>
        <div css={styles.title}>{event?.suiteName ?? 'Waiting for suite'}</div>
      </div>
      <div css={styles.meta}>
        <span css={styles.metaItem}>{event?.eventName ?? 'No events yet'}</span>
        {event ? <span css={styles.metaItem}>{formatTime(event.timestamp)}</span> : null}
      </div>
    </div>
  );
}

const styles = {
  root: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-radius: 14px;
    background: ${THEME.panelElevated};
    border: 1px solid ${THEME.panelBorder};
    box-shadow: 0 12px 22px rgba(7, 10, 20, 0.4);
  `,
  label: css`
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: ${THEME.textMuted};
  `,
  title: css`
    font-size: 16px;
    font-weight: 600;
    color: ${THEME.textPrimary};
  `,
  meta: css`
    display: flex;
    gap: 10px;
    color: ${THEME.textSecondary};
    font-size: 12px;
  `,
  metaItem: css`
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid ${THEME.panelBorder};
    background: ${THEME.panel};
  `,
};
