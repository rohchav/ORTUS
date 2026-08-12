export class BoundedHistory<T> {
  private readonly records: T[] = [];

  constructor(readonly maxLength: number) {
    if (!Number.isInteger(maxLength) || maxLength <= 0) {
      throw new Error("History maxLength must be a positive integer");
    }
  }

  push(record: T): void {
    this.records.push(record);
    while (this.records.length > this.maxLength) {
      this.records.shift();
    }
  }

  all(): readonly T[] {
    return this.records.map((record) => structuredClone(record));
  }

  last(): T | undefined {
    const record = this.records.at(-1);
    return record === undefined ? undefined : structuredClone(record);
  }

  reset(records: readonly T[] = []): void {
    this.records.length = 0;
    for (const record of records) {
      this.push(structuredClone(record));
    }
  }

  get length(): number {
    return this.records.length;
  }
}
