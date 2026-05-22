"use client";

import { useEffect, useRef, useState } from "react";
import {
  getContinuousWorld,
  getVelocity,
  renderAgents,
  renderGrid,
  type RenderAgent,
  type RenderGridAgent
} from "../lib/templateVisuals";
import { useSimulationStore, type AvatarMode } from "../state/simulationStore";

type Snapshot = NonNullable<ReturnType<typeof useSimulationStore.getState>["latestSnapshot"]>;

export function SimulationCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const snapshot = useSimulationStore((state) => state.latestSnapshot);
  const selectedEntityId = useSimulationStore((state) => state.selectedEntityId);
  const interventionTargetPoint = useSimulationStore((state) => state.interventionTargetPoint);
  const interventionTargetCell = useSimulationStore((state) => state.interventionTargetCell);
  const avatarMode = useSimulationStore((state) => state.avatarMode);
  const selectEntity = useSimulationStore((state) => state.selectEntity);
  const setInterventionTarget = useSimulationStore((state) => state.setInterventionTarget);
  const [size, setSize] = useState({ width: 900, height: 600 });

  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) {
        return;
      }
      setSize({
        width: Math.max(320, entry.contentRect.width),
        height: Math.max(260, entry.contentRect.height)
      });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !snapshot) {
      return;
    }
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = Math.floor(size.width * pixelRatio);
    canvas.height = Math.floor(size.height * pixelRatio);
    canvas.style.width = `${size.width}px`;
    canvas.style.height = `${size.height}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    drawWorld(ctx, size.width, size.height, snapshot, selectedEntityId, avatarMode, interventionTargetPoint, interventionTargetCell);
  }, [snapshot, selectedEntityId, avatarMode, size, interventionTargetPoint, interventionTargetCell]);

  return (
    <div ref={containerRef} className="canvas-shell">
      <canvas
        ref={canvasRef}
        className="simulation-canvas"
        role="img"
        tabIndex={0}
        onClick={(event) => {
          if (!snapshot) {
            return;
          }
          const canvas = canvasRef.current;
          if (!canvas) {
            return;
          }
          const rect = canvas.getBoundingClientRect();
          const click = { x: event.clientX - rect.left, y: event.clientY - rect.top };
          const selected = pickAgent(snapshot, click, size.width, size.height);
          const target = pickInterventionTarget(snapshot, click, size.width, size.height);
          selectEntity(selected);
          setInterventionTarget(target);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            selectEntity(null);
          }
        }}
        aria-label="Simulation world. Agents are rendered from the latest engine snapshot."
      />
    </div>
  );
}

function drawWorld(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  snapshot: Snapshot,
  selectedEntityId: string | null,
  avatarMode: AvatarMode,
  interventionTargetPoint: { x: number; y: number } | null,
  interventionTargetCell: { row: number; col: number } | null
): void {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "rgba(9, 8, 7, 0.12)";
  ctx.fillRect(0, 0, width, height);

  const grid = renderGrid(snapshot);
  if (grid) {
    drawGridWorld(ctx, width, height, snapshot, grid, selectedEntityId, avatarMode, interventionTargetCell);
    return;
  }

  const agents = renderAgents(snapshot);
  for (const agent of agents) {
    const screen = worldToScreen(snapshot, agent.x, agent.y, width, height);
    const glow = 8 + agent.radius * 2;
    ctx.beginPath();
    ctx.fillStyle = withAlpha(agent.fill, 0.14 * agent.intensity);
    ctx.arc(screen.x, screen.y, glow, 0, Math.PI * 2);
    ctx.fill();

    drawAvatar(ctx, snapshot, agent, screen, avatarMode, agent.id === selectedEntityId);

    if (agent.id === selectedEntityId) {
      drawSelectedOverlay(ctx, agent, screen);
    }
  }
  if (interventionTargetPoint) {
    drawInterventionPointTarget(ctx, worldToScreen(snapshot, interventionTargetPoint.x, interventionTargetPoint.y, width, height));
  }
}

function drawGridWorld(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  snapshot: Snapshot,
  grid: NonNullable<ReturnType<typeof renderGrid>>,
  selectedEntityId: string | null,
  avatarMode: AvatarMode,
  interventionTargetCell: { row: number; col: number } | null
): void {
  const bounds = gridBounds(width, height, grid.rows, grid.cols);
  const cellSize = Math.min(bounds.cellWidth, bounds.cellHeight);
  ctx.save();
  ctx.translate(bounds.x, bounds.y);

  ctx.fillStyle = "rgba(12, 15, 16, 0.48)";
  ctx.fillRect(0, 0, bounds.gridWidth, bounds.gridHeight);
  ctx.strokeStyle = "rgba(243, 241, 232, 0.06)";
  ctx.lineWidth = 1;
  for (let row = 0; row <= grid.rows; row += 1) {
    const y = row * bounds.cellHeight;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(bounds.gridWidth, y);
    ctx.stroke();
  }
  for (let col = 0; col <= grid.cols; col += 1) {
    const x = col * bounds.cellWidth;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, bounds.gridHeight);
    ctx.stroke();
  }

  for (const agent of grid.agents) {
    const screen = gridAgentCenter(bounds, agent);
    const radius = Math.max(3, Math.min(cellSize * 0.36, 9));
    ctx.beginPath();
    ctx.fillStyle = withAlpha(agent.fill, 0.12 * agent.intensity);
    ctx.rect(screen.x - bounds.cellWidth / 2 + 1, screen.y - bounds.cellHeight / 2 + 1, bounds.cellWidth - 2, bounds.cellHeight - 2);
    ctx.fill();
    drawGridAvatar(ctx, snapshot, agent, screen, radius, avatarMode, agent.id === selectedEntityId);
    if (agent.id === selectedEntityId) {
      drawGridSelectedOverlay(ctx, screen, Math.max(radius + 5, cellSize * 0.48));
    }
  }
  if (interventionTargetCell) {
    drawGridTargetOverlay(ctx, bounds, interventionTargetCell);
  }

  ctx.restore();
}

function drawInterventionPointTarget(ctx: CanvasRenderingContext2D, screen: { x: number; y: number }): void {
  ctx.save();
  ctx.beginPath();
  ctx.strokeStyle = "rgba(216, 255, 62, 0.88)";
  ctx.lineWidth = 1.4;
  ctx.arc(screen.x, screen.y, 13, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(screen.x - 18, screen.y);
  ctx.lineTo(screen.x - 6, screen.y);
  ctx.moveTo(screen.x + 6, screen.y);
  ctx.lineTo(screen.x + 18, screen.y);
  ctx.moveTo(screen.x, screen.y - 18);
  ctx.lineTo(screen.x, screen.y - 6);
  ctx.moveTo(screen.x, screen.y + 6);
  ctx.lineTo(screen.x, screen.y + 18);
  ctx.stroke();
  ctx.restore();
}

function drawGridTargetOverlay(ctx: CanvasRenderingContext2D, bounds: ReturnType<typeof gridBounds>, cell: { row: number; col: number }): void {
  ctx.beginPath();
  ctx.strokeStyle = "rgba(216, 255, 62, 0.92)";
  ctx.lineWidth = 1.6;
  ctx.rect(cell.col * bounds.cellWidth + 2, cell.row * bounds.cellHeight + 2, bounds.cellWidth - 4, bounds.cellHeight - 4);
  ctx.stroke();
}

function drawGridAvatar(
  ctx: CanvasRenderingContext2D,
  snapshot: Snapshot,
  agent: RenderGridAgent,
  screen: { x: number; y: number },
  radius: number,
  avatarMode: AvatarMode,
  selected: boolean
): void {
  const renderAgent: RenderAgent = {
    id: agent.id,
    entity: agent.entity,
    x: agent.col,
    y: agent.row,
    radius,
    fill: agent.fill,
    stroke: agent.stroke,
    glyph: agent.glyph,
    label: agent.label,
    intensity: agent.intensity
  };
  if (avatarMode === "arrow") {
    drawArrowAvatar(ctx, snapshot, renderAgent, screen, radius, selected);
  } else if (avatarMode === "initials") {
    drawInitialsAvatar(ctx, renderAgent, screen, radius, selected);
  } else if (avatarMode === "head") {
    drawHeadAvatar(ctx, renderAgent, screen, radius, selected);
  } else {
    drawGlyphAvatar(ctx, renderAgent, screen, radius, selected);
  }
  if (!agent.satisfied) {
    ctx.beginPath();
    ctx.strokeStyle = "rgba(255, 74, 46, 0.92)";
    ctx.lineWidth = selected ? 2 : 1.3;
    ctx.rect(screen.x - radius - 2, screen.y - radius - 2, radius * 2 + 4, radius * 2 + 4);
    ctx.stroke();
  }
}

function drawGridSelectedOverlay(ctx: CanvasRenderingContext2D, screen: { x: number; y: number }, radius: number): void {
  ctx.beginPath();
  ctx.strokeStyle = "rgba(243, 241, 232, .86)";
  ctx.lineWidth = 1.4;
  ctx.rect(screen.x - radius, screen.y - radius, radius * 2, radius * 2);
  ctx.stroke();
}

function drawAvatar(
  ctx: CanvasRenderingContext2D,
  snapshot: Snapshot,
  agent: RenderAgent,
  screen: { x: number; y: number },
  avatarMode: AvatarMode,
  selected: boolean
): void {
  const radius = Math.max(agent.radius + 2, 5.2);
  if (avatarMode === "arrow") {
    drawArrowAvatar(ctx, snapshot, agent, screen, radius, selected);
    return;
  }
  if (avatarMode === "initials") {
    drawInitialsAvatar(ctx, agent, screen, radius, selected);
    return;
  }
  if (avatarMode === "head") {
    drawHeadAvatar(ctx, agent, screen, radius, selected);
    return;
  }
  if (agent.shape === "directional") {
    drawArrowAvatar(ctx, snapshot, agent, screen, radius, selected);
    return;
  }
  drawGlyphAvatar(ctx, agent, screen, radius, selected);
}

function drawGlyphAvatar(ctx: CanvasRenderingContext2D, agent: RenderAgent, screen: { x: number; y: number }, radius: number, selected: boolean): void {
  ctx.beginPath();
  ctx.fillStyle = agent.fill;
  ctx.strokeStyle = agent.stroke;
  ctx.lineWidth = selected ? 2.4 : 1.2;
  ctx.arc(screen.x, screen.y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  drawCenteredText(ctx, agent.glyph, screen, Math.max(8, radius + 2), "#050708");
}

function drawArrowAvatar(
  ctx: CanvasRenderingContext2D,
  snapshot: Snapshot,
  agent: RenderAgent,
  screen: { x: number; y: number },
  radius: number,
  selected: boolean
): void {
  const velocity = getVelocity(snapshot, agent.id);
  const speed = velocity ? Math.hypot(velocity.x, velocity.y) : 0;
  const angle = speed > 0.001 && velocity ? Math.atan2(velocity.y, velocity.x) : stableAngle(agent.id);
  ctx.save();
  ctx.translate(screen.x, screen.y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(radius + 4, 0);
  ctx.lineTo(-radius * 0.7, -radius * 0.68);
  ctx.lineTo(-radius * 0.28, 0);
  ctx.lineTo(-radius * 0.7, radius * 0.68);
  ctx.closePath();
  ctx.fillStyle = agent.fill;
  ctx.strokeStyle = agent.stroke;
  ctx.lineWidth = selected ? 2.2 : 1.2;
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawInitialsAvatar(ctx: CanvasRenderingContext2D, agent: RenderAgent, screen: { x: number; y: number }, radius: number, selected: boolean): void {
  ctx.beginPath();
  ctx.fillStyle = agent.fill;
  ctx.strokeStyle = agent.stroke;
  ctx.lineWidth = selected ? 2.4 : 1.2;
  ctx.arc(screen.x, screen.y, radius + 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  drawCenteredText(ctx, initialsFor(agent), screen, Math.max(7, radius + 1), "#050708");
}

function drawHeadAvatar(ctx: CanvasRenderingContext2D, agent: RenderAgent, screen: { x: number; y: number }, radius: number, selected: boolean): void {
  ctx.beginPath();
  ctx.fillStyle = withAlpha(agent.fill, 0.76);
  ctx.strokeStyle = agent.stroke;
  ctx.lineWidth = selected ? 2.2 : 1.1;
  ctx.arc(screen.x, screen.y - radius * 0.22, radius * 0.74, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.fillStyle = agent.fill;
  ctx.ellipse(screen.x, screen.y + radius * 0.58, radius * 0.88, radius * 0.46, 0, Math.PI, 0);
  ctx.fill();
  ctx.stroke();
}

function drawSelectedOverlay(ctx: CanvasRenderingContext2D, agent: RenderAgent, screen: { x: number; y: number }): void {
  const outerRadius = Math.max(agent.radius + 12, 15);
  ctx.beginPath();
  ctx.strokeStyle = "rgba(243, 241, 232, .78)";
  ctx.lineWidth = 1.2;
  ctx.arc(screen.x, screen.y, outerRadius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.strokeStyle = "rgba(216, 255, 62, .52)";
  ctx.moveTo(screen.x - outerRadius - 5, screen.y);
  ctx.lineTo(screen.x - agent.radius - 4, screen.y);
  ctx.moveTo(screen.x + agent.radius + 4, screen.y);
  ctx.lineTo(screen.x + outerRadius + 5, screen.y);
  ctx.moveTo(screen.x, screen.y - outerRadius - 5);
  ctx.lineTo(screen.x, screen.y - agent.radius - 4);
  ctx.moveTo(screen.x, screen.y + agent.radius + 4);
  ctx.lineTo(screen.x, screen.y + outerRadius + 5);
  ctx.stroke();
}

function drawCenteredText(ctx: CanvasRenderingContext2D, text: string, screen: { x: number; y: number }, size: number, fill: string): void {
  ctx.fillStyle = fill;
  ctx.font = `800 ${size}px Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, screen.x, screen.y + 0.5);
}

function initialsFor(agent: RenderAgent): string {
  const source = agent.entity.label ?? agent.id;
  const tokens = source.trim().split(/\s+/).filter(Boolean);
  if (tokens.length >= 2) {
    const first = tokens[0]?.replace(/[^a-z0-9]/gi, "").slice(0, 1) ?? "";
    const numeric = tokens.at(-1)?.replace(/\D/g, "").slice(-1) ?? "";
    const second = numeric || tokens[1]?.replace(/[^a-z0-9]/gi, "").slice(0, 1) || "";
    return `${first}${second}`.toUpperCase() || agent.glyph;
  }
  const compact = source.replace(/[^a-z0-9]/gi, "").slice(0, 2).toUpperCase();
  return compact || agent.glyph;
}

function stableAngle(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return (hash / 0xffffffff) * Math.PI * 2;
}

function pickAgent(snapshot: Snapshot, click: { x: number; y: number }, width: number, height: number): string | null {
  const grid = renderGrid(snapshot);
  if (grid) {
    const bounds = gridBounds(width, height, grid.rows, grid.cols);
    if (
      click.x < bounds.x ||
      click.y < bounds.y ||
      click.x > bounds.x + bounds.gridWidth ||
      click.y > bounds.y + bounds.gridHeight
    ) {
      return null;
    }
    const col = Math.floor((click.x - bounds.x) / bounds.cellWidth);
    const row = Math.floor((click.y - bounds.y) / bounds.cellHeight);
    return grid.agents.find((agent) => agent.row === row && agent.col === col)?.id ?? null;
  }

  let best: { id: string; distance: number } | null = null;
  for (const agent of renderAgents(snapshot)) {
    const screen = worldToScreen(snapshot, agent.x, agent.y, width, height);
    const distance = Math.hypot(screen.x - click.x, screen.y - click.y);
    if (distance <= Math.max(12, agent.radius + 9) && (!best || distance < best.distance)) {
      best = { id: agent.id, distance };
    }
  }
  return best?.id ?? null;
}

function pickInterventionTarget(
  snapshot: Snapshot,
  click: { x: number; y: number },
  width: number,
  height: number
): { point: { x: number; y: number } | null; gridCell: { row: number; col: number } | null } {
  const grid = renderGrid(snapshot);
  if (grid) {
    const bounds = gridBounds(width, height, grid.rows, grid.cols);
    if (
      click.x < bounds.x ||
      click.y < bounds.y ||
      click.x > bounds.x + bounds.gridWidth ||
      click.y > bounds.y + bounds.gridHeight
    ) {
      return { point: null, gridCell: null };
    }
    return {
      point: null,
      gridCell: {
        row: Math.min(grid.rows - 1, Math.max(0, Math.floor((click.y - bounds.y) / bounds.cellHeight))),
        col: Math.min(grid.cols - 1, Math.max(0, Math.floor((click.x - bounds.x) / bounds.cellWidth)))
      }
    };
  }
  return { point: screenToWorld(snapshot, click.x, click.y, width, height), gridCell: null };
}

function gridBounds(width: number, height: number, rows: number, cols: number): {
  x: number;
  y: number;
  cellWidth: number;
  cellHeight: number;
  gridWidth: number;
  gridHeight: number;
} {
  const padding = 28;
  const availableWidth = Math.max(1, width - padding * 2);
  const availableHeight = Math.max(1, height - padding * 2);
  const cellSize = Math.min(availableWidth / cols, availableHeight / rows);
  const gridWidth = cellSize * cols;
  const gridHeight = cellSize * rows;
  return {
    x: (width - gridWidth) / 2,
    y: (height - gridHeight) / 2,
    cellWidth: cellSize,
    cellHeight: cellSize,
    gridWidth,
    gridHeight
  };
}

function gridAgentCenter(
  bounds: ReturnType<typeof gridBounds>,
  agent: RenderGridAgent
): { x: number; y: number } {
  return {
    x: agent.col * bounds.cellWidth + bounds.cellWidth / 2,
    y: agent.row * bounds.cellHeight + bounds.cellHeight / 2
  };
}

function worldToScreen(snapshot: Snapshot, x: number, y: number, width: number, height: number): { x: number; y: number } {
  const world = getContinuousWorld(snapshot);
  const padding = 28;
  return {
    x: padding + (x / world.width) * (width - padding * 2),
    y: padding + (y / world.height) * (height - padding * 2)
  };
}

function screenToWorld(snapshot: Snapshot, x: number, y: number, width: number, height: number): { x: number; y: number } {
  const world = getContinuousWorld(snapshot);
  const padding = 28;
  return {
    x: Math.max(0, Math.min(world.width, ((x - padding) / Math.max(1, width - padding * 2)) * world.width)),
    y: Math.max(0, Math.min(world.height, ((y - padding) / Math.max(1, height - padding * 2)) * world.height))
  };
}

function withAlpha(hex: string, alpha: number): string {
  const normalized = hex.replace("#", "");
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
