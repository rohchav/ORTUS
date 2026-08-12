import { RuntimeWorkerHost } from "../simulation/runtime/RuntimeWorkerHost";

interface WorkerScope {
  postMessage(message: unknown, transfer?: Transferable[]): void;
  addEventListener(type: "message", listener: (event: MessageEvent<unknown>) => void): void;
}

const scope = self as unknown as WorkerScope;
const host = new RuntimeWorkerHost({
  postMessage(message, transfer) {
    scope.postMessage(message, transfer);
  }
});

scope.addEventListener("message", (event) => host.handleMessage(event.data));
