import type { RuntimeWorkerLike } from "../../runtime/types";
import { RuntimeWorkerHost } from "../../runtime/RuntimeWorkerHost";

// A Worker transport backed by a real RuntimeWorkerHost; messages are structured-cloned like postMessage, so the
// production WorkerRuntimeDriver, host, and RuntimeSession run unchanged without a browser Worker.
export class HostBackedWorker implements RuntimeWorkerLike {
  readonly host: RuntimeWorkerHost;
  terminated = false;
  private readonly messageListeners = new Set<(event: MessageEvent<unknown>) => void>();
  private readonly errorListeners = new Set<(event: ErrorEvent) => void>();
  private readonly messageErrorListeners = new Set<(event: MessageEvent<unknown>) => void>();

  constructor() {
    this.host = new RuntimeWorkerHost({
      postMessage: (message, transfer) => {
        const cloned = structuredClone(message, transfer?.length ? { transfer } : undefined);
        queueMicrotask(() => this.emit(cloned));
      }
    });
  }

  postMessage(message: unknown): void {
    if (this.terminated) {
      throw new Error("Host-backed Worker is terminated");
    }
    const cloned = structuredClone(message);
    queueMicrotask(() => this.host.handleMessage(cloned));
  }

  terminate(): void {
    this.host.dispose();
    this.terminated = true;
  }

  addEventListener(type: "message" | "error" | "messageerror", listener: ((event: MessageEvent<unknown>) => void) | ((event: ErrorEvent) => void)): void {
    this.listeners(type).add(listener as never);
  }

  removeEventListener(type: "message" | "error" | "messageerror", listener: ((event: MessageEvent<unknown>) => void) | ((event: ErrorEvent) => void)): void {
    this.listeners(type).delete(listener as never);
  }

  emit(message: unknown): void {
    for (const listener of this.messageListeners) {
      listener({ data: message } as MessageEvent<unknown>);
    }
  }

  private listeners(type: "message" | "error" | "messageerror"): Set<any> {
    if (type === "message") return this.messageListeners;
    if (type === "error") return this.errorListeners;
    return this.messageErrorListeners;
  }
}

export function hostBackedWorkers(): { created: HostBackedWorker[]; create(): HostBackedWorker } {
  const created: HostBackedWorker[] = [];
  return {
    created,
    create(): HostBackedWorker {
      const worker = new HostBackedWorker();
      created.push(worker);
      return worker;
    }
  };
}
