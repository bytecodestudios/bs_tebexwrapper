// src/utils/debugData.ts

import { isEnvBrowser } from "./misc";

interface DebugEvent<T = any> {
  action: string;
  data: T;
}

/**
 * Emulates dispatching an NUI message from the client script.
 * @param events - An array of events to dispatch.
 * @param timer - The delay in milliseconds before dispatching the events.
 */
export const debugData = <T = any>(events: DebugEvent<T>[], timer = 1000) => {
  if (isEnvBrowser()) {
    for (const event of events) {
      setTimeout(() => {
        window.dispatchEvent(
          new MessageEvent("message", {
            data: {
              action: event.action,
              data: event.data,
            },
          })
        );
      }, timer);
    }
  }
};