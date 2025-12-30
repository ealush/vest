const port = chrome.runtime.connect({ name: 'content' });

function injectScript() {
  if (document.querySelector('script[data-vest-devtools]')) {
    return;
  }

  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('page-script.js');
  script.dataset.vestDevtools = 'true';
  script.onload = () => {
    script.remove();
  };

  (document.head || document.documentElement).appendChild(script);
}

injectScript();

window.addEventListener('message', event => {
  if (event.source !== window) {
    return;
  }

  const data = event.data;
  if (!data || data.source !== 'vest-devtools') {
    return;
  }

port.postMessage(data);
});

port.onMessage.addListener(message => {
  if (message?.type !== 'command') {
    return;
  }

  window.postMessage(
    {
      source: 'vest-devtools-command',
      ...message.payload,
    },
    '*',
  );
});
