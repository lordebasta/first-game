import type { Projectile } from "../entities/Projectile";

export interface Hit {
  damage: number;
  source: Projectile;
}
