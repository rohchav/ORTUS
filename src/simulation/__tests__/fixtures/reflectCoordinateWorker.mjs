// Runs reflectCoordinate in a worker thread so that engine.resourceBounds.test.ts can fail on a timeout
// instead of hanging if reflection ever loops without bound again. Node strips Space.ts types natively.
import { parentPort, workerData } from "node:worker_threads";

const { reflectCoordinate } = await import(workerData.moduleUrl);
parentPort.postMessage(workerData.cases.map(([value, max]) => reflectCoordinate(value, max)));
