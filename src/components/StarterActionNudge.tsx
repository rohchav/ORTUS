"use client";

import { useState } from "react";

export function StarterActionNudge() {
  const [visible, setVisible] = useState(true);

  if (!visible) {
    return null;
  }

  return (
    <aside className="starter-nudge" aria-label="Flocking starter steps" data-starter-nudge>
      <div>
        <strong>Flocking starter</strong>
        <ol>
          <li>Run the baseline</li>
          <li>Lower Alignment weight</li>
          <li>Run again</li>
          <li>Watch flock shape and Alignment score</li>
        </ol>
      </div>
      <button type="button" onClick={() => setVisible(false)} aria-label="Dismiss Flocking starter steps">
        Dismiss
      </button>
    </aside>
  );
}
