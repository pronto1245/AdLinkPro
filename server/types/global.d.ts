// Global type definitions for the server
declare global {
  namespace globalThis {
    let sendWebSocketNotification: ((userId: string, data: unknown) => void) | undefined;
  }
}

export {};