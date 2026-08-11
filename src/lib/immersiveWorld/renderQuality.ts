import type { ImmersiveAgentCount } from "./types";

export const immersiveRenderQualityLevels = ["high", "balanced", "performance"] as const;
export type ImmersiveRenderQuality = (typeof immersiveRenderQualityLevels)[number];

export interface ImmersiveRenderQualityPolicy {
  level: ImmersiveRenderQuality;
  pixelRatioCeiling: number;
  gridStep: number;
  shadowDetail: "all" | "selected" | "none";
  strokeDetail: "all" | "selected";
  trailPointLimit: number;
  trailUpdateEveryTicks: number;
  effectLimit: number;
}

const policies: Record<ImmersiveRenderQuality, ImmersiveRenderQualityPolicy> = {
  high: {
    level: "high",
    pixelRatioCeiling: 2,
    gridStep: 10,
    shadowDetail: "all",
    strokeDetail: "all",
    trailPointLimit: 12,
    trailUpdateEveryTicks: 1,
    effectLimit: 24
  },
  balanced: {
    level: "balanced",
    pixelRatioCeiling: 1.5,
    gridStep: 20,
    shadowDetail: "selected",
    strokeDetail: "selected",
    trailPointLimit: 8,
    trailUpdateEveryTicks: 2,
    effectLimit: 12
  },
  performance: {
    level: "performance",
    pixelRatioCeiling: 1,
    gridStep: 20,
    shadowDetail: "none",
    strokeDetail: "selected",
    trailPointLimit: 5,
    trailUpdateEveryTicks: 4,
    effectLimit: 0
  }
};

const sampleWindow = 90;
const minimumDecisionSamples = 45;
const decisionInterval = 30;
const recoverySamples = 240;

export class AdaptiveRenderQualityController {
  private quality: ImmersiveRenderQuality = "high";
  private samples: number[] = [];
  private samplesSinceDecision = 0;
  private stableRecoverySamples = 0;

  constructor(agentCount: ImmersiveAgentCount) {
    this.reset(agentCount);
  }

  reset(agentCount: ImmersiveAgentCount): void {
    this.quality = agentCount === 500 ? "balanced" : "high";
    this.samples = [];
    this.samplesSinceDecision = 0;
    this.stableRecoverySamples = 0;
  }

  recordFrameInterval(intervalMs: number): ImmersiveRenderQuality {
    if (!Number.isFinite(intervalMs) || intervalMs <= 0 || intervalMs > 1_000) {
      return this.quality;
    }
    this.samples.push(intervalMs);
    if (this.samples.length > sampleWindow) {
      this.samples.splice(0, this.samples.length - sampleWindow);
    }
    this.samplesSinceDecision += 1;
    if (this.samples.length < minimumDecisionSamples || this.samplesSinceDecision < decisionInterval) {
      return this.quality;
    }
    this.samplesSinceDecision = 0;
    const p95 = percentile([...this.samples].sort((left, right) => left - right), 0.95);
    if (p95 >= 64) {
      this.quality = degrade(this.quality);
      this.stableRecoverySamples = 0;
      return this.quality;
    }
    if (p95 <= 24) {
      this.stableRecoverySamples += decisionInterval;
      if (this.stableRecoverySamples >= recoverySamples) {
        this.quality = improve(this.quality);
        this.stableRecoverySamples = 0;
      }
    } else {
      this.stableRecoverySamples = 0;
    }
    return this.quality;
  }

  getPolicy(): ImmersiveRenderQualityPolicy {
    return policies[this.quality];
  }
}

export function immersiveRenderQualityPolicy(level: ImmersiveRenderQuality): ImmersiveRenderQualityPolicy {
  return policies[level];
}

function degrade(quality: ImmersiveRenderQuality): ImmersiveRenderQuality {
  if (quality === "high") {
    return "balanced";
  }
  return "performance";
}

function improve(quality: ImmersiveRenderQuality): ImmersiveRenderQuality {
  if (quality === "performance") {
    return "balanced";
  }
  return "high";
}

function percentile(sorted: readonly number[], fraction: number): number {
  if (sorted.length === 0) {
    return 0;
  }
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * fraction) - 1));
  return sorted[index] ?? 0;
}
