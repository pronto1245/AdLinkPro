// Global type definitions for the server
declare global {
  namespace globalThis {
    var sendWebSocketNotification: ((userId: string, data: any) => void) | undefined;
  }
}

export {};