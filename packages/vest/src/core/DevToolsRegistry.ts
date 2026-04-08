/**
 * DevTools Suite Registry
 *
 * This file should be placed at:
 * /Users/ealush/dev/vest/packages/vest/src/core/DevToolsRegistry.ts
 *
 * Global registry of all active Vest suite instances for DevTools integration.
 * Uses WeakSet to avoid memory leaks - suites can be garbage collected when no longer used.
 */

import { Suite } from '../suite/SuiteTypes';

declare global {
  interface Window {
    __vest_devtools_connect?: (suite: Suite<any, any, any, any>) => void;
    __VEST_DEVTOOLS_REGISTRY__?: DevToolsRegistry;
  }
}

declare const window: Window | undefined;

class DevToolsRegistry {
  private suites: Set<Suite<any, any, any, any>> = new Set();
  private autoConnectEnabled = false;

  /**
   * Register a suite for DevTools inspection
   */
  register(suite: Suite<any, any, any, any>): void {
    this.suites.add(suite);

    // Auto-connect if devtools module is loaded
    if (this.autoConnectEnabled && typeof window !== 'undefined') {
      if (window.__vest_devtools_connect) {
        try {
          window.__vest_devtools_connect(suite);
        } catch (error) {
          // Silent fail - DevTools connection is optional
        }
      }
    }
  }

  /**
   * Unregister a suite (called when suite is disposed)
   */
  unregister(suite: Suite<any, any, any, any>): void {
    this.suites.delete(suite);
  }

  /**
   * Get all registered suites
   */
  getAllSuites(): Suite<any, any, any, any>[] {
    return Array.from(this.suites);
  }

  /**
   * Enable auto-connection (called by vest/devtools module)
   */
  enableAutoConnect(): void {
    this.autoConnectEnabled = true;
  }

  /**
   * Check if auto-connect is enabled
   */
  isAutoConnectEnabled(): boolean {
    return this.autoConnectEnabled;
  }

  /**
   * Clear all registered suites (for testing)
   */
  clear(): void {
    this.suites.clear();
  }
}

// Singleton instance
export const devtoolsRegistry = new DevToolsRegistry();

// Make it accessible globally for debugging
if (typeof window !== 'undefined') {
  (window as any).__VEST_DEVTOOLS_REGISTRY__ = devtoolsRegistry;
}
