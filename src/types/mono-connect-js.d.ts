declare module "@mono.co/connect.js" {
  interface MonoSuccessPayload {
    code: string;
    [key: string]: unknown;
  }

  interface MonoConnectOptions {
    onClose?: () => void;
    onLoad?: () => void;
    onEvent?: (eventName: string, payload: unknown) => void;
    onSuccess: (payload: MonoSuccessPayload) => void;
    [key: string]: unknown;
  }

  export default class MonoConnect {
    constructor(config: { key: string } & MonoConnectOptions);
    setup(config?: Record<string, unknown>): void;
    open(): void;
    close(): void;
    reauthorise(accountId: string): void;
    fetchInstitutions(): Promise<unknown>;
  }
}
