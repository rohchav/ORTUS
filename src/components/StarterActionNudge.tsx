"use client";

import Link from "next/link";
import { useState } from "react";
import { requireStarterWorldById } from "../lib/starterWorlds";

interface StarterActionNudgeProps {
  starterWorldId: string;
}

export function StarterActionNudge({ starterWorldId }: StarterActionNudgeProps) {
  const [visible, setVisible] = useState(true);
  const world = requireStarterWorldById(starterWorldId);

  if (!visible) {
    return null;
  }

  function dismiss() {
    setVisible(false);
    requestAnimationFrame(() => document.querySelector<HTMLElement>(".world-stage")?.focus());
  }

  return (
    <aside
      className="starter-nudge"
      aria-label={`${world.title} starter steps`}
      data-starter-nudge
      data-starter-world-id={world.id}
    >
      <div className="starter-nudge__copy">
        <p>
          Exploring: <Link href={`/worlds/${world.slug}`}>{world.title}</Link>
        </p>
        <ol>
          <li>{world.firstRun.action}</li>
          <li>{world.firstChange.action}</li>
          <li>Watch {world.whatToWatch.map((item) => item.label).join(" and ")}.</li>
        </ol>
      </div>
      <button type="button" onClick={dismiss} aria-label={`Dismiss ${world.title} starter steps`}>
        Dismiss
      </button>
    </aside>
  );
}
