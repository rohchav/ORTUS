export const rawGuidedInvestigationDefinitions = [
  {
    id: "reading-a-flock",
    version: "1",
    slug: "reading-a-flock",
    title: "Reading a Flock",
    shortTitle: "Read the flock",
    hookQuestion: "When local steering becomes noisy, do alignment and dispersion change in the same way?",
    summary:
      "Run one audited prepared pair and inspect directional coordination, spatial spread, and visible motion without treating one model run as a general finding.",
    estimatedMinutes: 8,
    mode: "prepared-pair-reading",
    packId: "local-rules-global-patterns",
    starterWorldId: "coordination-under-sensor-noise",
    preparedComparisonId: "coordination-noise-comparison",
    focusOutputIds: ["alignmentScore", "dispersion"],
    opening: [
      "Run the same initialized flock twice.",
      "Only the steering-noise setting changes.",
      "Watch whether directional alignment and spatial dispersion tell the same story."
    ],
    phases: [
      {
        id: "clear-signals-baseline",
        recipeRole: "baseline",
        title: "Clear-signals baseline",
        steps: [
          {
            id: "confirm-prepared-start",
            title: "Start from the prepared flock",
            summary:
              "Inspect the active prepared configuration and its audited paired starting-state statement before motion begins.",
            actions: [{ type: "inspect-start" }, { type: "open-task", task: "setup" }],
            technicalChecks: ["correct-recipe-loaded", "run-is-paused", "tick-is-zero"]
          },
          {
            id: "run-clear-signals",
            title: "Watch coordinated motion form",
            summary:
              "Use the existing playback controls and watch the live world through the prepared recipe's suggested horizon.",
            actions: [{ type: "run-prepared-world" }],
            technicalChecks: ["tick-reached-horizon"]
          },
          {
            id: "read-baseline-outputs",
            title: "Alignment is not dispersion",
            summary:
              "Inspect directional similarity, spatial spread, and visible motion as distinct views of this model run.",
            actions: [{ type: "inspect-outputs" }, { type: "open-task", task: "observe" }],
            technicalChecks: ["metric-is-available", "task-is-visible"],
            prompts: [
              "Does the flock move in a common direction?",
              "Is it tightly grouped or spread out?",
              "Which output seems more sensitive in this run?"
            ]
          },
          {
            id: "capture-baseline-summary",
            title: "Keep the baseline available",
            summary:
              "Use the existing Compare task to capture a bounded run summary explicitly, then open the paired fresh run when ready.",
            actions: [
              { type: "open-compare" },
              { type: "open-task", task: "compare" },
              { type: "launch-paired-recipe" }
            ],
            technicalChecks: ["comparison-summary-exists", "task-is-visible"]
          }
        ]
      },
      {
        id: "noisy-signals-contrast",
        recipeRole: "contrast",
        title: "Noisy-signals contrast",
        steps: [
          {
            id: "confirm-paired-reset",
            title: "Start the paired run",
            summary:
              "Confirm that this recipe is a fresh run and inspect the audited controlled difference without assuming the baseline was run.",
            actions: [{ type: "inspect-start" }, { type: "open-task", task: "setup" }],
            technicalChecks: ["paired-recipe-loaded", "run-is-paused", "tick-is-zero"]
          },
          {
            id: "run-noisy-signals",
            title: "Give the contrast equal runtime",
            summary:
              "Use the existing playback controls for the same prepared horizon so the bounded summaries are easier to inspect.",
            actions: [{ type: "run-prepared-world" }],
            technicalChecks: ["tick-reached-horizon"]
          },
          {
            id: "read-contrast-outputs",
            title: "Read alignment and spread again",
            summary:
              "Inspect the same model outputs and visible motion without assuming that either output must move in a particular direction.",
            actions: [{ type: "inspect-outputs" }, { type: "open-task", task: "observe" }],
            technicalChecks: ["metric-is-available", "task-is-visible"],
            prompts: [
              "Did directional alignment change?",
              "Did dispersion change by a similar amount?",
              "Does the visible flock support the same interpretation as both metrics?"
            ]
          },
          {
            id: "review-prepared-comparison",
            title: "Compare without overgeneralizing",
            summary:
              "Use only the existing comparison workspace, then reflect on what this fixed pair can and cannot show.",
            actions: [
              { type: "open-compare" },
              { type: "open-task", task: "compare" },
              { type: "review-differences" },
              { type: "reflect" },
              { type: "exit-guide" }
            ],
            technicalChecks: ["comparison-summary-exists", "task-is-visible"]
          }
        ]
      }
    ],
    reflectionPrompts: [
      "Which changed more in your prepared runs: Alignment or Dispersion?",
      "Did the visual movement and numeric outputs suggest the same interpretation?",
      "What additional run would help distinguish a seed-specific outcome from a broader model pattern?",
      "What intermediate Noise setting would you investigate next?"
    ],
    modelBoundary:
      "This guide compares two fixed, stylized model runs. It helps inspect model behavior; it does not establish a universal threshold, real-world validity, or learning outcome.",
    nextActions: ["open-setup", "open-flagship", "open-collection", "exit-guide"]
  }
];
