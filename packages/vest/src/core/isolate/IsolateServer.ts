import { Isolate } from 'vestjs-runtime';
import { isFunction } from 'vest-utils';

import { getAbortController } from '../test/Abortable';
import { useServerAdapter } from '../server/ServerAdapter';
import { Protocol } from '../server/Protocol';
import { ServerRegistry } from '../server/ServerRegistry';
import { ServerSession } from '../server/Session';

const pendingControllers = new Map<string, AbortController>();

// @vx-allow use-use
export function server(session: ServerSession, actionOrData: any): any {
  if (isFunction(actionOrData)) {
    ServerRegistry.register(session.id, actionOrData);
    return;
  }

  return Isolate.create('IsolateServer', current => {
    const transport = useServerAdapter();

    if (!transport) {
      throw new Error(
        '[Vest] No server adapter configured. Call `createServerAdapter`.',
      );
    }

    const controller = getAbortController(current);
    const previous = pendingControllers.get(session.id);
    if (previous && previous !== controller) {
      previous.abort('re-run');
    }
    pendingControllers.set(session.id, controller);

    return transport(session.id, actionOrData, { signal: controller.signal })
      .then(result => {
        return Protocol.validate(result).unwrap();
      })
      .finally(() => {
        if (pendingControllers.get(session.id) === controller) {
          pendingControllers.delete(session.id);
        }
      });
  });
}
