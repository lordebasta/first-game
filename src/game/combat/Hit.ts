export interface Hit {
  damage: number;
  /** Projectile, beam emitter or another combat object responsible for the hit. */
  source: object;
}
