import { useCallback, useMemo, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { HISTORY_LIMIT } from '../constants';
import { useDevtoolsStore } from '../store';
import type { VestEventPayload } from '../types';

const EVENTS_QUERY_KEY = ['vest-events'];

export type EventRecord = VestEventPayload & { id: string };

export function useEventHistory() {
  const queryClient = useQueryClient();
  const selectedEventId = useDevtoolsStore(state => state.selectedEventId);
  const setSelectedEventId = useDevtoolsStore(
    state => state.setSelectedEventId,
  );
  const sequenceRef = useRef(0);

  const { data: events = [] } = useQuery<EventRecord[]>({
    queryKey: EVENTS_QUERY_KEY,
    queryFn: () => Promise.resolve([]),
    initialData: [],
    staleTime: Infinity,
  });

  const selectedEvent = useMemo(
    () => events.find(event => event.id === selectedEventId) ?? events[0],
    [events, selectedEventId],
  );

  const addEvent = useCallback(
    (payload: VestEventPayload) => {
      const id = `event-${sequenceRef.current++}`;
      const record: EventRecord = { ...payload, id };

      queryClient.setQueryData(EVENTS_QUERY_KEY, (current: EventRecord[] = []) =>
        [record, ...current].slice(0, HISTORY_LIMIT),
      );

      const currentSelection = useDevtoolsStore.getState().selectedEventId;
      if (!currentSelection) {
        setSelectedEventId(id);
      }
    },
    [queryClient, setSelectedEventId],
  );

  const selectEvent = useCallback(
    (id: string) => {
      setSelectedEventId(id);
    },
    [setSelectedEventId],
  );

  return {
    events,
    selectedEvent,
    selectedEventId,
    addEvent,
    selectEvent,
  };
}
