/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { FOCUS_LABELS, THEME } from '../constants';
import type { FieldSnapshot } from '../types';

type FieldRowProps = {
  field: FieldSnapshot;
  statusLabel: string;
  focusTag: 'only' | 'skip' | null;
};

export function FieldRow({ field, statusLabel, focusTag }: FieldRowProps) {
  return (
    <div css={styles.root}>
      <div css={styles.titleRow}>
        <span css={styles.fieldName}>{field.name}</span>
        <div css={styles.tagRow}>
          {focusTag ? <span css={styles.focusTag(focusTag)}>{FOCUS_LABELS[focusTag]}</span> : null}
          <span css={styles.statusTag(statusLabel)}>{statusLabel}</span>
        </div>
      </div>
      <div css={styles.meta}>
        <span>{field.errorCount} errors</span>
        <span>{field.warnCount} warnings</span>
        <span>{field.pendingCount} pending</span>
      </div>
    </div>
  );
}

const styles = {
  root: css`
    padding: 10px 12px;
    border-radius: 12px;
    background: ${THEME.panel};
    border: 1px solid ${THEME.panelBorder};
    display: flex;
    flex-direction: column;
    gap: 6px;
  `,
  titleRow: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  `,
  fieldName: css`
    font-weight: 600;
    color: ${THEME.textPrimary};
  `,
  tagRow: css`
    display: flex;
    gap: 6px;
    align-items: center;
  `,
  statusTag: (status: string) => css`
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    color: ${resolveStatusColor(status)};
    background: rgba(15, 19, 35, 0.7);
    border: 1px solid ${THEME.panelBorder};
  `,
  focusTag: (mode: 'only' | 'skip') => css`
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    color: ${mode === 'only' ? THEME.accent : THEME.textSecondary};
    background: ${mode === 'only' ? THEME.accentSoft : 'rgba(148, 163, 184, 0.12)'};
    border: 1px solid ${THEME.panelBorder};
  `,
  meta: css`
    display: flex;
    gap: 12px;
    font-size: 11px;
    color: ${THEME.textMuted};
  `,
};

function resolveStatusColor(status: string) {
  switch (status) {
    case 'error':
      return THEME.status.error;
    case 'warning':
      return THEME.status.warning;
    case 'pending':
      return THEME.status.pending;
    case 'passing':
      return THEME.status.passing;
    default:
      return THEME.textMuted;
  }
}
