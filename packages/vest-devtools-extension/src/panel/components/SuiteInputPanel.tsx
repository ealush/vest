/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useMemo } from 'react';

import { LABELS, THEME } from '../constants';
import { formatJson, normalizeInput } from '../domain/formatters';

type SuiteInputPanelProps = {
  inputData: unknown;
  manualInput: string;
  error: string | null;
  onManualInputChange: (value: string) => void;
  onApplyInput: () => void;
  onTriggerValidation: () => void;
};

export function SuiteInputPanel({
  inputData,
  manualInput,
  error,
  onManualInputChange,
  onApplyInput,
  onTriggerValidation,
}: SuiteInputPanelProps) {
  const formattedInput = useMemo(
    () => formatJson(normalizeInput(inputData)),
    [inputData],
  );

  return (
    <div css={styles.root}>
      <div css={styles.card}>
        <div css={styles.headerRow}>
          <h2 css={styles.title}>{LABELS.suiteInput}</h2>
          <span css={styles.badge}>Read-only</span>
        </div>
        <pre css={styles.code}>{formattedInput}</pre>
      </div>
      <div css={styles.card}>
        <div css={styles.headerRow}>
          <h2 css={styles.title}>{LABELS.manualInput}</h2>
        </div>
        <textarea
          css={styles.textarea}
          rows={8}
          value={manualInput}
          onChange={event => onManualInputChange(event.target.value)}
          placeholder="{ \"username\": \"\" }"
        />
        {error ? <div css={styles.errorText}>{error}</div> : null}
        <div css={styles.actionRow}>
          <button type="button" css={styles.secondaryButton} onClick={onApplyInput}>
            {LABELS.applyInput}
          </button>
          <button type="button" css={styles.primaryButton} onClick={onTriggerValidation}>
            {LABELS.triggerValidation}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  root: css`
    display: flex;
    flex-direction: column;
    gap: 16px;
  `,
  card: css`
    background: ${THEME.panelElevated};
    border: 1px solid ${THEME.panelBorder};
    border-radius: 14px;
    padding: 16px;
    box-shadow: 0 14px 24px rgba(7, 10, 20, 0.45);
  `,
  headerRow: css`
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
  `,
  title: css`
    margin: 0;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: ${THEME.textMuted};
  `,
  badge: css`
    padding: 2px 8px;
    border-radius: 999px;
    background: ${THEME.panel};
    border: 1px solid ${THEME.panelBorder};
    font-size: 11px;
    color: ${THEME.textSecondary};
  `,
  code: css`
    margin: 0;
    background: rgba(10, 12, 24, 0.9);
    border-radius: 10px;
    padding: 12px;
    color: ${THEME.textPrimary};
    font-size: 12px;
    overflow: auto;
  `,
  textarea: css`
    width: 100%;
    border-radius: 10px;
    border: 1px solid ${THEME.panelBorder};
    background: rgba(10, 12, 24, 0.9);
    color: ${THEME.textPrimary};
    padding: 12px;
    font-family: ui-monospace, SFMono-Regular, SFMono-Regular, Menlo, Monaco,
      Consolas, 'Liberation Mono', 'Courier New', monospace;
    font-size: 12px;
  `,
  actionRow: css`
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 12px;
  `,
  primaryButton: css`
    border: none;
    border-radius: 10px;
    padding: 8px 14px;
    font-weight: 600;
    cursor: pointer;
    color: ${THEME.textPrimary};
    background: linear-gradient(135deg, ${THEME.accent}, ${THEME.accentStrong});
  `,
  secondaryButton: css`
    border: 1px solid ${THEME.panelBorder};
    border-radius: 10px;
    padding: 8px 14px;
    font-weight: 600;
    cursor: pointer;
    color: ${THEME.textPrimary};
    background: ${THEME.panel};
  `,
  errorText: css`
    color: ${THEME.status.error};
    font-size: 12px;
    margin-top: 6px;
  `,
};
