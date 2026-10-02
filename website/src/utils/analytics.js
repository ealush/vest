export function ensureGtag() {
  if (typeof window === 'undefined' || typeof window.gtag === 'function') {
    return;
  }

  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
}

export function trackAdoptionEvent(action, label) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return;
  }

  window.gtag('event', 'vest_adoption', {
    action,
    label,
    page_path: window.location.pathname,
    transport_type: 'beacon',
  });
}

export function classifyAdoptionClick(target) {
  const tracked = target.closest('[data-adoption-event]');
  if (tracked) {
    return {
      action: tracked.dataset.adoptionEvent,
      label: tracked.dataset.adoptionLabel ?? tracked.textContent?.trim(),
    };
  }

  const copyButton = target.closest(
    'button[aria-label*="copy" i], button[title*="copy" i]',
  );
  if (copyButton) {
    const code = copyButton.closest('.theme-code-block')?.querySelector('code');
    return {
      action: 'copy_code',
      label: code?.textContent?.includes('npm i vest')
        ? 'install_command'
        : 'documentation_code',
    };
  }

  const link = target.closest('a[href]');
  if (!link) return null;

  const url = new URL(link.href, window.location.origin);
  const destinations = {
    'discord.com': 'discord',
    'discord.gg': 'discord',
    'github.com': 'github',
    'npmjs.com': 'npm',
    'www.npmjs.com': 'npm',
  };
  const label = destinations[url.hostname];

  return label ? { action: 'outbound_click', label } : null;
}
