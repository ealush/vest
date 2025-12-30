/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { LABELS, THEME } from '../constants';

type HeaderBarProps = {
  connected: boolean;
  onToggleHistory: () => void;
  onRunSuite: () => void;
  historyOpen: boolean;
};

export function HeaderBar({
  connected,
  onToggleHistory,
  onRunSuite,
  historyOpen,
}: HeaderBarProps) {
  return (
    <header css={styles.root}>
      <div css={styles.titleRow}>
        <div css={styles.logo} aria-hidden />
        <div>
          <h1 css={styles.title}>{LABELS.appTitle}</h1>
          <span css={styles.statusBadge(connected)}>
            {connected ? LABELS.connected : LABELS.disconnected}
          </span>
        </div>
      </div>
      <div css={styles.actions}>
        <button type="button" css={styles.secondaryButton} onClick={onToggleHistory}>
          {historyOpen ? 'Close History' : LABELS.history}
        </button>
        <button type="button" css={styles.primaryButton} onClick={onRunSuite}>
          {LABELS.rerun}
        </button>
      </div>
    </header>
  );
}

const styles = {
  root: css`
    padding: 12px 16px;
    border-bottom: 1px solid ${THEME.panelBorder};
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(12, 16, 32, 0.9);
  `,
  titleRow: css`
    display: flex;
    align-items: center;
    gap: 12px;
  `,
  logo: css`
    width: 32px;
    height: 32px;
    border-radius: 10px;
    background: linear-gradient(135deg, ${THEME.accent}, ${THEME.accentStrong});
    box-shadow: 0 6px 16px rgba(99, 102, 241, 0.35);
  `,
  title: css`
    margin: 0;
    font-size: 16px;
    color: ${THEME.textPrimary};
  `,
  statusBadge: (connected: boolean) => css`
    display: inline-flex;
    margin-top: 4px;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    background: ${connected ? 'rgba(74, 222, 128, 0.18)' : 'rgba(248, 113, 113, 0.2)'};
    color: ${connected ? THEME.status.passing : THEME.status.error};
  `,
  actions: css`
    display: flex;
    align-items: center;
    gap: 10px;
  `,
  primaryButton: css`
    border: none;
    border-radius: 10px;
    padding: 8px 14px;
    font-weight: 600;
    cursor: pointer;
    color: ${THEME.textPrimary};
    background: linear-gradient(135deg, ${THEME.accent}, ${THEME.accentStrong});
    box-shadow: 0 10px 20px rgba(99, 102, 241, 0.28);
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
};
