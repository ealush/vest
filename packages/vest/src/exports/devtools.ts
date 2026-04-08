/**
 * Vest DevTools Integration
 *
 * This file should be placed at:
 * /Users/ealush/dev/vest/packages/vest/src/exports/devtools.ts
 *
 * Side-effect module that auto-connects Vest suites to the browser DevTools extension.
 *
 * Usage:
 *   import 'vest/devtools';
 *
 * This import should be placed at the top of your application entry point, before any
 * suite definitions. It will automatically connect all created suites to the Vest DevTools
 * extension without requiring manual __vest_devtools_connect() calls.
 */

import { Suite } from '../suite/SuiteTypes';
import { devtoolsRegistry } from '../core/DevToolsRegistry';

// Global flag to indicate devtools module is loaded
declare global {
  interface Window {
    __VEST_DEVTOOLS_ENABLED__?: boolean;
    __vest_devtools_connect?: (suite: Suite<any, any, any, any>) => void;
  }
}

declare const window: Window | undefined;
declare const document: any;

// Enable auto-connect in the registry
devtoolsRegistry.enableAutoConnect();

// Check if we're in a browser environment
if (typeof window !== 'undefined') {
  // Set global flag
  window.__VEST_DEVTOOLS_ENABLED__ = true;

  // Check if DevTools extension is already present
  if (typeof window.__vest_devtools_connect === 'function') {
    // DevTools extension is loaded - connect all existing suites
    const existingSuites = devtoolsRegistry.getAllSuites();
    existingSuites.forEach(suite => {
      try {
        window.__vest_devtools_connect?.(suite);
      } catch (error) {
        // Silent fail - DevTools connection is optional
      }
    });
  }

  // Listen for DevTools extension initialization
  const checkForDevTools = () => {
    if (
      window.__vest_devtools_connect &&
      typeof window.__vest_devtools_connect === 'function'
    ) {
      // DevTools just became available - connect all suites
      const allSuites = devtoolsRegistry.getAllSuites();
      allSuites.forEach(suite => {
        try {
          window.__vest_devtools_connect?.(suite);
        } catch (error) {
          // Silent fail - DevTools connection is optional
        }
      });
    }
  };

  // Poll for DevTools extension (it injects after page load)
  const pollInterval = setInterval(() => {
    if (window.__vest_devtools_connect) {
      checkForDevTools();
      clearInterval(pollInterval);
    }
  }, 100);

  // Stop polling after 10 seconds
  setTimeout(() => {
    clearInterval(pollInterval);
  }, 10000);

  // Also check on DOM ready
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', checkForDevTools);
    } else {
      // DOM already ready, check immediately
      setTimeout(checkForDevTools, 0);
    }
  }
}

// Export a helper to manually register suites (for SSR or other edge cases)
export function connectSuiteToDevTools(suite: Suite<any, any, any, any>): void {
  if (typeof window !== 'undefined' && window.__vest_devtools_connect) {
    try {
      window.__vest_devtools_connect(suite);
    } catch (error) {
      // Silent fail - DevTools connection is optional
    }
  }
}

// Export registry for advanced use cases
export { devtoolsRegistry };
