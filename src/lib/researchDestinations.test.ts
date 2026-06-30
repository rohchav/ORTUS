import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  getCanonicalResearchDestinationRoutes,
  getResearchDestinationByPathname,
  researchDestinations
} from "./researchDestinations";

const repoRoot = process.cwd();

describe("Research World destination registry", () => {
  it("defines exactly the GW1 destinations in canonical order with canonical routes", () => {
    expect(researchDestinations.map((destination) => destination.id)).toEqual(["world", "lab", "atlas", "workshop"]);
    expect(researchDestinations.map((destination) => destination.label)).toEqual(["World", "Lab", "Atlas", "Workshop"]);
    expect(researchDestinations.map((destination) => destination.navigationOrder)).toEqual([1, 2, 3, 4]);
    expect(getCanonicalResearchDestinationRoutes()).toEqual(["/", "/lab", "/atlas", "/builder"]);
    expect(new Set(researchDestinations.map((destination) => destination.id)).size).toBe(researchDestinations.length);
    expect(new Set(researchDestinations.map((destination) => destination.route)).size).toBe(researchDestinations.length);
  });

  it("keeps route mapping route-derived without world/workshop aliases", () => {
    expect(getResearchDestinationByPathname("/")?.id).toBe("world");
    expect(getResearchDestinationByPathname("/lab")?.id).toBe("lab");
    expect(getResearchDestinationByPathname("/atlas")?.id).toBe("atlas");
    expect(getResearchDestinationByPathname("/builder")?.id).toBe("workshop");
    expect(getResearchDestinationByPathname("/builder/graph")?.id).toBe("workshop");
    expect(getResearchDestinationByPathname("/lab/notes")?.id).toBe("lab");
    expect(getResearchDestinationByPathname("/lab?panel=notes")?.id).toBe("lab");
    expect(getResearchDestinationByPathname("/atlas#regimes")?.id).toBe("atlas");
    expect(getResearchDestinationByPathname("/builder/?mode=graph#node-a")?.id).toBe("workshop");
    expect(getResearchDestinationByPathname("lab/notes")?.id).toBe("lab");
    expect(getResearchDestinationByPathname("/world")).toBeNull();
    expect(getResearchDestinationByPathname("/workshop")).toBeNull();
    expect(getResearchDestinationByPathname("/world?alias=true")).toBeNull();
    expect(getResearchDestinationByPathname("/workshop#builder")).toBeNull();
    expect(existsSync(join(repoRoot, "src", "app", "world"))).toBe(false);
    expect(existsSync(join(repoRoot, "src", "app", "workshop"))).toBe(false);
  });

  it("distinguishes available routes from future-only informational destinations", () => {
    const byId = Object.fromEntries(researchDestinations.map((destination) => [destination.id, destination]));
    expect(byId.world?.availability).toBe("available");
    expect(byId.workshop?.availability).toBe("available");
    expect(byId.lab).toMatchObject({
      availability: "future-only",
      status: { category: "capability", state: "future-only" }
    });
    expect(byId.atlas).toMatchObject({
      availability: "future-only",
      status: { category: "capability", state: "future-only" }
    });
    expect(JSON.stringify(researchDestinations)).not.toMatch(/\b(locked|disabled|unlock|xp|level|achievement|progress)\b/i);
  });

  it("keeps destination records free of persistence, progression, and fabricated data fields", () => {
    const forbiddenKeys = [
      "localStorageKey",
      "storageKey",
      "database",
      "savedCount",
      "recentItems",
      "visitHistory",
      "xp",
      "level",
      "rank",
      "unlock",
      "locked",
      "progress",
      "achievement",
      "discoveryCount",
      "experimentCount"
    ];

    for (const destination of researchDestinations) {
      expect(destination.purpose.trim().length).toBeGreaterThan(0);
      for (const key of forbiddenKeys) {
        expect(Object.prototype.hasOwnProperty.call(destination, key)).toBe(false);
      }
    }

    const source = readFileSync(join(repoRoot, "src", "lib", "researchDestinations.ts"), "utf8");
    expect(source).not.toMatch(/localStorage|indexedDB|cookie|database|cloud|account|auth/i);
  });
});
