import type { WorldEntity, Zone, Vec2 } from "./types";
import { WORLD_W, WORLD_H } from "./types";

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ─── Content zones spread across the open face ───
export const zones: Zone[] = [
  { id: "about", pos: { x: 1100, y: 1600 }, radius: 180, label: "About Me" },
  { id: "experience", pos: { x: 600, y: 3400 }, radius: 220, label: "Experience" },
  { id: "education", pos: { x: 1500, y: 5200 }, radius: 180, label: "Education" },
  { id: "skills", pos: { x: 800, y: 7000 }, radius: 180, label: "Skills" },
  { id: "projects", pos: { x: 1400, y: 8800 }, radius: 180, label: "Projects" },
  { id: "contact", pos: { x: 1000, y: 10400 }, radius: 220, label: "Base Lodge" },
];

export function generateEntities(): WorldEntity[] {
  const entities: WorldEntity[] = [];
  const rand = seededRandom(42);

  // Lodges at each zone
  for (const zone of zones) {
    entities.push({
      pos: { x: zone.pos.x, y: zone.pos.y },
      type: "lodge",
      size: zone.id === "contact" ? 1.3 : 1,
      zoneId: zone.id,
      label: zone.label,
    });
    // Sign pointing to lodge
    entities.push({
      pos: { x: zone.pos.x - 110, y: zone.pos.y - 80 },
      type: "sign",
      size: 1,
      label: zone.label,
    });
  }

  // ─── Trees: denser at edges, sparser in the middle ───
  const treeCount = 500;
  for (let i = 0; i < treeCount; i++) {
    const y = 300 + rand() * (WORLD_H - 500);
    // Bias X toward edges for natural treeline feel
    let x: number;
    const r = rand();
    if (r < 0.3) {
      // Left edge cluster
      x = rand() * 350;
    } else if (r < 0.6) {
      // Right edge cluster
      x = WORLD_W - rand() * 350;
    } else {
      // Scattered throughout
      x = 100 + rand() * (WORLD_W - 200);
    }

    // Keep clear of zones
    let tooClose = false;
    for (const zone of zones) {
      if (dist(x, y, zone.pos.x, zone.pos.y) < zone.radius + 50) {
        tooClose = true;
        break;
      }
    }
    if (tooClose) continue;

    const isSmall = rand() > 0.55;
    entities.push({
      pos: { x, y },
      type: isSmall ? "treeSmall" : "tree",
      size: 0.6 + rand() * 0.8,
    });
  }

  // ─── Rocks scattered across the face ───
  const rockCount = 70;
  for (let i = 0; i < rockCount; i++) {
    const x = 80 + rand() * (WORLD_W - 160);
    const y = 500 + rand() * (WORLD_H - 800);

    let tooClose = false;
    for (const zone of zones) {
      if (dist(x, y, zone.pos.x, zone.pos.y) < zone.radius + 40) {
        tooClose = true;
        break;
      }
    }
    if (tooClose) continue;

    entities.push({
      pos: { x, y },
      type: "rock",
      size: 0.4 + rand() * 0.8,
    });
  }

  // ─── Cliff bands (horizontal rock shelves) ───
  const cliffBands = [
    { y: 2400, xStart: 200, xEnd: 700 },
    { y: 4200, xStart: 1100, xEnd: 1700 },
    { y: 6200, xStart: 400, xEnd: 1000 },
    { y: 8200, xStart: 900, xEnd: 1500 },
  ];
  for (const band of cliffBands) {
    for (let x = band.xStart; x < band.xEnd; x += 40 + rand() * 30) {
      entities.push({
        pos: { x, y: band.y + (rand() - 0.5) * 20 },
        type: "cliff",
        size: 0.7 + rand() * 0.6,
      });
    }
  }

  // ─── Tree stumps ───
  for (let i = 0; i < 30; i++) {
    const x = 100 + rand() * (WORLD_W - 200);
    const y = 400 + rand() * (WORLD_H - 600);
    entities.push({
      pos: { x, y },
      type: "stump",
      size: 0.5 + rand() * 0.4,
    });
  }

  // ─── Mogul fields ───
  const mogulFields = [
    { cx: 500, cy: 1200, count: 15 },
    { cx: 1400, cy: 2800, count: 12 },
    { cx: 700, cy: 4800, count: 18 },
    { cx: 1200, cy: 6600, count: 14 },
    { cx: 900, cy: 9200, count: 10 },
  ];
  for (const field of mogulFields) {
    for (let m = 0; m < field.count; m++) {
      entities.push({
        pos: {
          x: field.cx + (rand() - 0.5) * 250,
          y: field.cy + (rand() - 0.5) * 200,
        },
        type: "mogul",
        size: 0.3 + rand() * 0.5,
      });
    }
  }

  return entities;
}

function dist(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return Math.sqrt(dx * dx + dy * dy);
}

export function distVec(a: Vec2, b: Vec2): number {
  return dist(a.x, a.y, b.x, b.y);
}
