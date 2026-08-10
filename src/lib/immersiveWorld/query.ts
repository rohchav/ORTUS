import { z } from "zod";
import { immersiveAgentCounts, immersiveConceptIds, type ImmersivePrototypeRouteConfig } from "./types";

const immersivePrototypeQuerySchema = z
  .object({
    concept: z.enum(immersiveConceptIds).default("living-diorama"),
    agents: z.enum(immersiveAgentCounts.map(String) as ["100", "500"]).default("100")
  })
  .strict();

export type ImmersivePrototypeQueryResult =
  | { ok: true; config: ImmersivePrototypeRouteConfig }
  | { ok: false; message: string };

export function parseImmersivePrototypeQuery(
  query: Record<string, string | string[] | undefined>
): ImmersivePrototypeQueryResult {
  const parsed = immersivePrototypeQuerySchema.safeParse(query);
  if (!parsed.success) {
    return {
      ok: false,
      message: "The prototype URL accepts one concept and one bounded agent load only."
    };
  }
  return {
    ok: true,
    config: {
      concept: parsed.data.concept,
      agentCount: Number(parsed.data.agents) as ImmersivePrototypeRouteConfig["agentCount"]
    }
  };
}

export function immersivePrototypeHref(config: ImmersivePrototypeRouteConfig): string {
  const query = new URLSearchParams({
    concept: config.concept,
    agents: String(config.agentCount)
  });
  return `/world/immersive-prototype?${query.toString()}`;
}
