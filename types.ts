
export type FireworkType = 'peony' | 'cross' | 'meteor' | 'random';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  size: number;
  decay: number;
  gravity: number;
  friction: number;
  flicker?: boolean;
}

export interface Firework {
  x: number;
  y: number;
  targetY: number;
  color: string;
  particles: Particle[];
  exploded: boolean;
}

export interface WishResponse {
  message: string;
  theme: string;
  colors: string[];
}
