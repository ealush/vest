const devtoolsPorts = new Map();
const contentPorts = new Map();

chrome.runtime.onConnect.addListener(port => {
  if (port.name === 'devtools') {
    let tabId = null;

    port.onMessage.addListener(message => {
      if (message?.type === 'init') {
        tabId = message.tabId;
        devtoolsPorts.set(tabId, port);

        const contentPort = contentPorts.get(tabId);
        if (contentPort) {
          contentPort.postMessage({ type: 'devtools-attached' });
        }
        return;
      }

      if (message?.type === 'command' && tabId !== null) {
        const contentPort = contentPorts.get(tabId);
        if (contentPort) {
          contentPort.postMessage(message);
        }
      }
    });

    port.onDisconnect.addListener(() => {
      if (tabId !== null) {
        devtoolsPorts.delete(tabId);
      }
    });

    return;
  }

  if (port.name === 'content') {
    const tabId = port.sender?.tab?.id;

    if (tabId == null) {
      return;
    }

    contentPorts.set(tabId, port);

    port.onMessage.addListener(message => {
      const devtoolsPort = devtoolsPorts.get(tabId);
      if (devtoolsPort) {
        devtoolsPort.postMessage(message);
      }
    });

    port.onDisconnect.addListener(() => {
      contentPorts.delete(tabId);
    });
  }
});
