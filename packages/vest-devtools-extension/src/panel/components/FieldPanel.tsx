/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { LABELS, THEME } from '../constants';
import type { FieldSnapshot, SuiteSnapshot } from '../types';
import {
  deriveSuiteStatus,
  filterFields,
  getFieldStatusLabel,
  getFocusTag,
} from '../domain/suite';
import { FieldRow } from './FieldRow';

type FieldPanelProps = {
  snapshot?: SuiteSnapshot;
  filter: string;
  onFilterChange: (value: string) => void;
};

export function FieldPanel({ snapshot, filter, onFilterChange }: FieldPanelProps) {
  const fields = snapshot?.fields ?? [];
  const visibleFields = filterFields(fields, filter);
  const totalCount = fields.length;
  const visibleCount = visibleFields.length;
  const suiteStatus = deriveSuiteStatus(snapshot);

  return (
    <div css={styles.root}>
      <div css={styles.card}>
        <div css={styles.cardHeader}>
          <h2 css={styles.cardTitle}>{LABELS.suiteResult}</h2>
        </div>
        <div css={styles.cardContent}>
          <div css={styles.suiteStatus(suiteStatus)}>
            {suiteStatus === 'unknown' ? 'Unknown' : suiteStatus === 'valid' ? 'Valid' : 'Invalid'}
          </div>
          <div css={styles.suiteMeta}>
            <span css={styles.metaItem}>
              <span css={styles.dot(THEME.status.error)} />
              {snapshot?.errorCount ?? 0} Errors
            </span>
            <span css={styles.metaItem}>
              <span css={styles.dot(THEME.status.warning)} />
              {snapshot?.warnCount ?? 0} Warnings
            </span>
            <span css={styles.metaItem}>
              {snapshot?.testCount ?? 0} Total
            </span>
          </div>
        </div>
      </div>
      <div css={styles.filterRow}>
        <input
          css={styles.filterInput}
          placeholder={LABELS.fieldFilterPlaceholder}
          value={filter}
          onChange={event => onFilterChange(event.target.value)}
        />
      </div>
      <div css={styles.fields}>
        {visibleFields.length ? (
          visibleFields.map(field => (
            <FieldRow
              key={field.name}
              field={field}
              focusTag={getFocusTag(
                snapshot?.focus ?? { mode: null, match: [], matchAll: false },
                field.name,
              )}
              statusLabel={getFieldStatusLabel(field.status)}
            />
          ))
        ) : (
          <p css={styles.empty}>No fields available.</p>
        )}
      </div>
      <div css={styles.footer}>
        Showing {visibleCount} of {totalCount} fields
      </div>
    </div>
  );
}

const styles = {
  root: css`
    display: flex;
    flex-direction: column;
    gap: 12px;
    height: 100%;
  `,
  card: css`
    background: ${THEME.panelElevated};
    border: 1px solid ${THEME.panelBorder};
    border-radius: 12px;
    padding: 12px 14px;
    box-shadow: 0 12px 24px rgba(7, 10, 20, 0.4);
  `,
  cardHeader: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
  `,
  cardTitle: css`
    margin: 0;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: ${THEME.textMuted};
  `,
  cardContent: css`
    margin-top: 12px;
  `,
  suiteStatus: (status: 'valid' | 'invalid' | 'unknown') => css`
    font-size: 18px;
    font-weight: 600;
    color: ${status === 'unknown' ? THEME.textMuted : THEME.suiteStatus.valid};
  `,
  suiteMeta: css`
    margin-top: 10px;
    display: flex;
    gap: 12px;
    color: ${THEME.textSecondary};
    font-size: 12px;
  `,
  metaItem: css`
    display: inline-flex;
    align-items: center;
    gap: 6px;
  `,
  dot: (color: string) => css`
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: ${color};
  `,
  filterRow: css`
    padding: 0 2px;
  `,
  filterInput: css`
    width: 100%;
    padding: 8px 12px;
    border-radius: 10px;
    border: 1px solid ${THEME.panelBorder};
    background: ${THEME.panel};
    color: ${THEME.textPrimary};
    font-size: 12px;
  `,
  fields: css`
    flex: 1;
    overflow: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,
  empty: css`
    color: ${THEME.textMuted};
  `,
  footer: css`
    color: ${THEME.textMuted};
    font-size: 12px;
    padding-top: 4px;
  `,
};
