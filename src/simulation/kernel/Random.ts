import type { RandomServiceState } from "./types";
import { SimulationValidationError } from "./Errors";

export class RandomStream {
  private state: number;
  private spareNormal: number | undefined;

  constructor(state: number, spareNormal?: number) {
    this.state = state >>> 0;
    this.spareNormal = spareNormal;
  }

  float(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  int(min: number, max: number): number {
    if (!Number.isInteger(min) || !Number.isInteger(max) || max < min) {
      throw new SimulationValidationError("Random integer bounds must be integers with max >= min");
    }
    return min + Math.floor(this.float() * (max - min + 1));
  }

  bool(probability: number): boolean {
    if (!Number.isFinite(probability) || probability < 0 || probability > 1) {
      throw new SimulationValidationError("Random boolean probability must be between 0 and 1");
    }
    return this.float() < probability;
  }

  choice<T>(array: readonly T[]): T {
    if (array.length === 0) {
      throw new SimulationValidationError("Cannot choose from an empty array");
    }
    return array[this.int(0, array.length - 1)] as T;
  }

  shuffle<T>(array: readonly T[]): T[] {
    const copy = [...array];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = this.int(0, index);
      const value = copy[index] as T;
      copy[index] = copy[swapIndex] as T;
      copy[swapIndex] = value;
    }
    return copy;
  }

  normal(mean = 0, stdDev = 1): number {
    if (!Number.isFinite(mean) || !Number.isFinite(stdDev) || stdDev < 0) {
      throw new SimulationValidationError("Normal distribution parameters must be finite and stdDev must be nonnegative");
    }
    if (this.spareNormal !== undefined) {
      const value = this.spareNormal;
      this.spareNormal = undefined;
      return mean + value * stdDev;
    }
    let u = 0;
    let v = 0;
    while (u === 0) {
      u = this.float();
    }
    while (v === 0) {
      v = this.float();
    }
    const magnitude = Math.sqrt(-2 * Math.log(u));
    const z0 = magnitude * Math.cos(2 * Math.PI * v);
    const z1 = magnitude * Math.sin(2 * Math.PI * v);
    this.spareNormal = z1;
    return mean + z0 * stdDev;
  }

  getState(): { state: number; spareNormal?: number } {
    return {
      state: this.state >>> 0,
      ...(this.spareNormal !== undefined ? { spareNormal: this.spareNormal } : {})
    };
  }

  setState(state: { state: number; spareNormal?: number }): void {
    if (!Number.isInteger(state.state) || state.state < 0 || state.state > 0xffffffff) {
      throw new SimulationValidationError("Invalid random stream state");
    }
    this.state = state.state >>> 0;
    this.spareNormal = state.spareNormal;
  }
}

export class RandomService {
  readonly seed: string;
  private readonly streams = new Map<string, RandomStream>();

  constructor(seed: string | number = "default-seed") {
    this.seed = String(seed);
    this.streams.set("default", new RandomStream(hashString(`${this.seed}:default`)));
  }

  float(): number {
    return this.stream("default").float();
  }

  int(min: number, max: number): number {
    return this.stream("default").int(min, max);
  }

  bool(probability: number): boolean {
    return this.stream("default").bool(probability);
  }

  choice<T>(array: readonly T[]): T {
    return this.stream("default").choice(array);
  }

  shuffle<T>(array: readonly T[]): T[] {
    return this.stream("default").shuffle(array);
  }

  normal(mean = 0, stdDev = 1): number {
    return this.stream("default").normal(mean, stdDev);
  }

  fork(name: string): RandomStream {
    return this.stream(name);
  }

  stream(name: string): RandomStream {
    const existing = this.streams.get(name);
    if (existing) {
      return existing;
    }
    const created = new RandomStream(hashString(`${this.seed}:${name}`));
    this.streams.set(name, created);
    return created;
  }

  getState(): RandomServiceState {
    const streams: RandomServiceState["streams"] = {};
    for (const name of [...this.streams.keys()].sort((left, right) => left.localeCompare(right))) {
      const stream = this.streams.get(name);
      if (stream) {
        streams[name] = stream.getState();
      }
    }
    return {
      seed: this.seed,
      streams
    };
  }

  setState(state: RandomServiceState): void {
    this.streams.clear();
    for (const name of Object.keys(state.streams).sort((left, right) => left.localeCompare(right))) {
      const streamState = state.streams[name];
      if (streamState) {
        this.streams.set(name, new RandomStream(streamState.state, streamState.spareNormal));
      }
    }
    if (!this.streams.has("default")) {
      this.streams.set("default", new RandomStream(hashString(`${this.seed}:default`)));
    }
  }
}

function hashString(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
