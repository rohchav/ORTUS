"use client";

import type { KeyboardEvent } from "react";

export const builderExperiences = [
  {
    id: "guided",
    label: "Guided Builder",
    description: "Create a bounded model-structure draft step by step."
  },
  {
    id: "advanced",
    label: "Advanced Builder",
    description: "Use the complete structural authoring and inspection tools."
  }
] as const;

export type BuilderExperienceId = (typeof builderExperiences)[number]["id"];

interface BuilderExperienceTabsProps {
  activeExperience: BuilderExperienceId;
  onExperienceChange: (experience: BuilderExperienceId) => void;
}

export function BuilderExperienceTabs({ activeExperience, onExperienceChange }: BuilderExperienceTabsProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, experienceId: BuilderExperienceId) {
    const currentIndex = builderExperiences.findIndex((experience) => experience.id === experienceId);
    const nextIndex =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? (currentIndex + 1) % builderExperiences.length
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? (currentIndex - 1 + builderExperiences.length) % builderExperiences.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? builderExperiences.length - 1
              : null;
    if (nextIndex === null) {
      return;
    }
    event.preventDefault();
    const nextExperience = builderExperiences[nextIndex]!;
    onExperienceChange(nextExperience.id);
    focusExperience(nextExperience.id);
  }

  return (
    <nav className="builder-experience-tabs" aria-label="Workshop authoring views" role="tablist">
      {builderExperiences.map((experience) => (
        <button
          key={experience.id}
          id={`builder-experience-tab-${experience.id}`}
          type="button"
          role="tab"
          aria-selected={experience.id === activeExperience}
          aria-controls={`builder-experience-panel-${experience.id}`}
          tabIndex={experience.id === activeExperience ? 0 : -1}
          className={experience.id === activeExperience ? "is-active" : ""}
          onClick={() => onExperienceChange(experience.id)}
          onKeyDown={(event) => handleKeyDown(event, experience.id)}
          suppressHydrationWarning
        >
          <span>{experience.label}</span>
          <em>{experience.description}</em>
        </button>
      ))}
    </nav>
  );
}

function focusExperience(experienceId: BuilderExperienceId): void {
  if (typeof document === "undefined") {
    return;
  }
  window.requestAnimationFrame(() => {
    document.getElementById(`builder-experience-tab-${experienceId}`)?.focus();
  });
}
