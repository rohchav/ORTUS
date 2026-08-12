export class LatestPublicationGate<T> {
  private inFlight: { key: number; value: T } | undefined;
  private pending: { key: number; value: T } | undefined;
  private disposed = false;

  constructor(
    private readonly send: (value: T) => void,
    private readonly keyOf: (value: T) => number,
    private readonly onSent: () => void,
    private readonly onCoalesced: () => void
  ) {}

  offer(value: T): void {
    if (this.disposed) {
      return;
    }
    const entry = { key: this.keyOf(value), value };
    if (!this.inFlight) {
      this.sendNow(entry);
      return;
    }
    this.pending = entry;
    this.onCoalesced();
  }

  acknowledge(key: number): void {
    if (this.disposed || this.inFlight?.key !== key) {
      return;
    }
    this.inFlight = undefined;
    const pending = this.pending;
    this.pending = undefined;
    if (pending) {
      this.sendNow(pending);
    }
  }

  reset(): void {
    this.inFlight = undefined;
    this.pending = undefined;
  }

  dispose(): void {
    this.reset();
    this.disposed = true;
  }

  counts(): { inFlight: number; pending: number } {
    return { inFlight: this.inFlight ? 1 : 0, pending: this.pending ? 1 : 0 };
  }

  private sendNow(entry: { key: number; value: T }): void {
    this.inFlight = entry;
    try {
      this.send(entry.value);
      this.onSent();
    } catch (error) {
      this.inFlight = undefined;
      throw error;
    }
  }
}
