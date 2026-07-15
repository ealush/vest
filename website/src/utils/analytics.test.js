import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  classifyAdoptionClick,
  ensureGtag,
  trackAdoptionEvent,
} from './analytics';

function target({ closest }) {
  return { closest };
}

describe('adoption analytics classification', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('prefers explicitly labeled adoption events', () => {
    const tracked = {
      dataset: { adoptionEvent: 'run_demo', adoptionLabel: 'async_race' },
      textContent: 'Run demo',
    };

    expect(
      classifyAdoptionClick(
        target({
          closest: selector =>
            selector === '[data-adoption-event]' ? tracked : null,
        }),
      ),
    ).toEqual({ action: 'run_demo', label: 'async_race' });
  });

  it('classifies documentation code-copy buttons without collecting code', () => {
    const codeBlock = {
      querySelector: () => ({ textContent: 'npm i vest' }),
    };
    const copyButton = {
      closest: selector =>
        selector === '.theme-code-block' ? codeBlock : null,
    };

    expect(
      classifyAdoptionClick(
        target({
          closest: selector =>
            selector.includes('button[aria-label') ? copyButton : null,
        }),
      ),
    ).toEqual({ action: 'copy_code', label: 'install_command' });
  });

  it.each([
    ['https://discord.com/invite/WmADZpJnSe', 'discord'],
    ['https://discord.gg/WmADZpJnSe', 'discord'],
    ['https://github.com/ealush/vest', 'github'],
    ['https://www.npmjs.com/package/vest', 'npm'],
  ])('classifies %s as an outbound %s click', (href, label) => {
    vi.stubGlobal('window', { location: { origin: 'https://vestjs.dev' } });
    const link = { href };

    expect(
      classifyAdoptionClick(
        target({
          closest: selector => (selector === 'a[href]' ? link : null),
        }),
      ),
    ).toEqual({ action: 'outbound_click', label });
  });

  it('sends only the configured action, label, and page path', () => {
    const gtag = vi.fn();
    vi.stubGlobal('window', {
      gtag,
      location: { pathname: '/docs/get_started' },
    });

    trackAdoptionEvent('docs_cta', 'hero_get_started');

    expect(gtag).toHaveBeenCalledWith('event', 'vest_adoption', {
      action: 'docs_cta',
      label: 'hero_get_started',
      page_path: '/docs/get_started',
      transport_type: 'beacon',
    });
  });

  it('installs a queueing gtag shim when analytics is unavailable', () => {
    const dataLayer = [];
    vi.stubGlobal('window', { dataLayer });

    ensureGtag();
    window.gtag('set', 'page_path', '/docs/get_started');
    window.gtag('event', 'page_view');

    expect(window.gtag).toBeTypeOf('function');
    expect(dataLayer).toHaveLength(2);
    expect([...dataLayer[0]]).toEqual([
      'set',
      'page_path',
      '/docs/get_started',
    ]);
    expect([...dataLayer[1]]).toEqual(['event', 'page_view']);
  });

  it('preserves an existing gtag implementation', () => {
    const gtag = vi.fn();
    vi.stubGlobal('window', { gtag });

    ensureGtag();

    expect(window.gtag).toBe(gtag);
  });
});
