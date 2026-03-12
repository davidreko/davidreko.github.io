export interface Vec2 {
  x: number;
  y: number;
}

export type EntityType =
  | "tree"
  | "treeSmall"
  | "rock"
  | "lodge"
  | "sign"
  | "mogul"
  | "cliff"
  | "stump";

export interface WorldEntity {
  pos: Vec2;
  type: EntityType;
  size: number;
  zoneId?: string;
  label?: string;
}

export interface Zone {
  id: string;
  pos: Vec2;
  radius: number;
  label: string;
}

export interface SkierState {
  pos: Vec2;
  vel: Vec2;
  angle: number;
  speed: number;
  isTucking: boolean;
  isBraking: boolean;
  trail: Vec2[];
  crashed: boolean;
  crashTimer: number;
  invincible: number; // frames of invincibility after crash
}

// World dimensions
export const WORLD_W = 2000;
export const WORLD_H = 11000;

// Physics
export const BASE_GRAVITY = 2.5;
export const TUCK_GRAVITY = 5;
export const BRAKE_GRAVITY = 0.3;
export const TURN_SPEED = 0.05;
export const MAX_TURN = Math.PI / 3;
export const FRICTION = 0.985;
export const LATERAL_DRAG = 0.9;
export const MAX_SPEED = 12;
export const MIN_SPEED = 0.5;
export const TRAIL_LENGTH = 80;

// Collision
export const TREE_RADIUS = 12;
export const ROCK_RADIUS = 10;
export const SKIER_RADIUS = 8;
