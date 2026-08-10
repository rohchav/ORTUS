const maxPerformanceSamples = 360;

export interface ImmersiveRenderPerformanceSummary {
  elapsedMs: number;
  frameCount: number;
  fps: number;
  medianFrameMs: number;
  p95FrameMs: number;
  longFrameCount: number;
  medianDrawMs: number;
  p95DrawMs: number;
  trailPointCount: number;
  effectCount: number;
}

export class ImmersiveRenderPerformanceMonitor {
  private startedAt = 0;
  private lastFrameAt: number | null = null;
  private frameCount = 0;
  private longFrameCount = 0;
  private frameIntervals: number[] = [];
  private drawDurations: number[] = [];
  private trailPointCount = 0;
  private effectCount = 0;

  reset(at: number): void {
    this.startedAt = at;
    this.lastFrameAt = null;
    this.frameCount = 0;
    this.longFrameCount = 0;
    this.frameIntervals = [];
    this.drawDurations = [];
    this.trailPointCount = 0;
    this.effectCount = 0;
  }

  recordFrame(at: number, drawMs: number, trailPointCount: number, effectCount: number): void {
    if (this.startedAt === 0) {
      this.reset(at);
    }
    if (this.lastFrameAt !== null) {
      const interval = Math.max(0, at - this.lastFrameAt);
      pushBounded(this.frameIntervals, interval);
      this.frameCount += 1;
      if (interval > 50) {
        this.longFrameCount += 1;
      }
    }
    this.lastFrameAt = at;
    pushBounded(this.drawDurations, Math.max(0, drawMs));
    this.trailPointCount = trailPointCount;
    this.effectCount = effectCount;
  }

  summary(at: number): ImmersiveRenderPerformanceSummary {
    const elapsedMs = Math.max(0, at - this.startedAt);
    const frameIntervals = [...this.frameIntervals].sort((left, right) => left - right);
    const drawDurations = [...this.drawDurations].sort((left, right) => left - right);
    return {
      elapsedMs,
      frameCount: this.frameCount,
      fps: elapsedMs > 0 ? (this.frameCount / elapsedMs) * 1000 : 0,
      medianFrameMs: percentile(frameIntervals, 0.5),
      p95FrameMs: percentile(frameIntervals, 0.95),
      longFrameCount: this.longFrameCount,
      medianDrawMs: percentile(drawDurations, 0.5),
      p95DrawMs: percentile(drawDurations, 0.95),
      trailPointCount: this.trailPointCount,
      effectCount: this.effectCount
    };
  }
}

function pushBounded(target: number[], value: number): void {
  target.push(value);
  if (target.length > maxPerformanceSamples) {
    target.splice(0, target.length - maxPerformanceSamples);
  }
}

function percentile(sorted: readonly number[], fraction: number): number {
  if (sorted.length === 0) {
    return 0;
  }
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * fraction) - 1));
  return sorted[index] ?? 0;
}
