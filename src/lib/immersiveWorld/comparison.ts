export const immersiveComparisonRubric = [
  { id: "presence", label: "Presence", question: "Does the model world feel spatially present?" },
  { id: "directness", label: "Directness", question: "Can observation and selection happen in the world?" },
  { id: "scientific-clarity", label: "Scientific clarity", question: "Are model state and atmosphere distinguishable?" },
  { id: "stage-dominance", label: "Stage dominance", question: "Does the live world remain the primary surface?" },
  { id: "discoverability", label: "Discoverability", question: "Are the current tool and camera state legible?" },
  { id: "expert-access", label: "Expert access", question: "Can exact runtime values remain reachable?" },
  { id: "performance", label: "Performance", question: "What is the measured cost at 100 and 500 boids?" },
  { id: "responsive", label: "Responsive viability", question: "Does the interaction language survive constrained viewports?" },
  { id: "accessibility", label: "Accessibility viability", question: "Do keyboard and DOM equivalents preserve access?" },
  { id: "cross-template", label: "Cross-template potential", question: "Could the interaction language fit other audited templates?" }
] as const;
