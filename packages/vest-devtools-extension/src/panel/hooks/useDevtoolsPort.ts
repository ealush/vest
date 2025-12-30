import { useCallback, useEffect, useRef, useState } from 'react';

import type { DevtoolsCommand, VestEventPayload } from '../types';

type PortMessage = { type?: string; payload?: VestEventPayload };

export function useDevtoolsPort(onEvent: (payload: VestEventPayload) => void) {
  const portRef = useRef<chrome.runtime.Port | null>(null);
  const [connected, setConnected] = useState(false);

  const sendCommand = useCallback((command: DevtoolsCommand) => {
    portRef.current?.postMessage({ type: 'command', payload: command });
  }, []);

  useEffect(() => {
    const port = chrome.runtime.connect({ name: 'devtools' });
    const tabId = chrome.devtools.inspectedWindow.tabId;

    portRef.current = port;
    port.postMessage({ type: 'init', tabId });
    setConnected(true);

    const handler = (message: PortMessage) => {
      if (message?.type === 'event' && message.payload) {
        onEvent(message.payload);
      }
    };

    port.onMessage.addListener(handler);

    port.onDisconnect.addListener(() => {
      setConnected(false);
    });

    return () => {
      port.onMessage.removeListener(handler);
      port.disconnect();
      portRef.current = null;
    };
  }, [onEvent]);

  return { connected, sendCommand };
}
