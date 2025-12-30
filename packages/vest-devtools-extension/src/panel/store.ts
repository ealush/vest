import { create } from 'zustand';

type DevtoolsStore = {
  selectedEventId: string | null;
  setSelectedEventId: (id: string | null) => void;
  historyOpen: boolean;
  setHistoryOpen: (open: boolean) => void;
  fieldFilter: string;
  setFieldFilter: (value: string) => void;
  manualInputs: Record<string, string>;
  setManualInput: (suiteId: string, value: string) => void;
};

export const useDevtoolsStore = create<DevtoolsStore>(set => ({
  selectedEventId: null,
  setSelectedEventId: selectedEventId => set({ selectedEventId }),
  historyOpen: false,
  setHistoryOpen: historyOpen => set({ historyOpen }),
  fieldFilter: '',
  setFieldFilter: fieldFilter => set({ fieldFilter }),
  manualInputs: {},
  setManualInput: (suiteId, value) =>
    set(state => ({
      manualInputs: { ...state.manualInputs, [suiteId]: value },
    })),
}));
