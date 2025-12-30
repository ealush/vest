export const THEME = {
  background:
    'radial-gradient(circle at 40% 35%, rgba(120, 132, 255, 0.25), transparent 55%), linear-gradient(180deg, #0c1020 0%, #0b0e1a 85%)',
  panel: 'rgba(15, 19, 35, 0.92)',
  panelElevated: 'rgba(20, 24, 44, 0.92)',
  panelBorder: 'rgba(255, 255, 255, 0.08)',
  textPrimary: '#f8fafc',
  textSecondary: '#cbd5e1',
  textMuted: '#9aa5d6',
  accent: '#6366f1',
  accentStrong: '#4f46e5',
  accentSoft: 'rgba(99, 102, 241, 0.18)',
  status: {
    error: '#ff5c7c',
    warning: '#f6a648',
    passing: '#4ade80',
    pending: '#e879f9',
  },
  suiteStatus: {
    valid: '#7c9bff',
    invalid: '#7c9bff',
  },
};

export const LABELS = {
  appTitle: 'Vest Validations',
  connected: 'Connected',
  disconnected: 'Disconnected',
  history: 'History',
  rerun: 'Re-run Suite',
  suiteResult: 'Suite Result',
  suiteInput: 'Suite Input Data',
  manualInput: 'Manual Input',
  applyInput: 'Apply Input',
  triggerValidation: 'Trigger Validation',
  fieldFilterPlaceholder: 'Filter fields by name...',
};

export const STATUS_LABELS = {
  passing: 'passing',
  failing: 'error',
  pending: 'pending',
  warning: 'warning',
  idle: 'idle',
} as const;

export const FOCUS_LABELS = {
  only: 'Only',
  skip: 'Skip',
};

export const HISTORY_LIMIT = 200;
