import type { Vec2, Camera } from "../types";

export function toScreen(
  world: Vec2,
  cam: Camera,
  cw: number,
  ch: number
): { sx: number; sy: number } {
  return {
    sx: world.x - cam.x + cw / 2,
    sy: world.y - cam.y + ch / 3,
  };
}

export function isVisible(
  sx: number,
  sy: number,
  cw: number,
  ch: number,
  margin = 100
): boolean {
  return sx > -margin && sx < cw + margin && sy > -margin && sy < ch + margin;
}

/** Seeded noise for consistent terrain texture */
export function hash(x: number, y: number): number {
  let h = x * 374761393 + y * 668265263;
  h = ((h ^ (h >> 13)) * 1274126177) | 0;
  return ((h ^ (h >> 16)) >>> 0) / 4294967296;
}
