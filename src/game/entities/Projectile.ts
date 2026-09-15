import Phaser from "phaser";
import type { Hittable } from "../combat/Hittable";
import { COLORS } from "../constants";

const PROJECTILE_SPEED = 620;

export interface ProjectileOptions {
  damage?: number;
  speedMultiplier?: number;
  pierce?: number;
  explosionRadius?: number;
  tint?: number;
  scale?: number;
}

export class Projectile extends Phaser.Physics.Arcade.Sprite {
  damage = 1;
  private remainingHits = 1;
  private hitTargets = new Set<Hittable>();
  explosionRadius = 0;

  constructor(scene: Phaser.Scene, x = 0, y = 0) {
    super(scene, x, y, "projectile");
  }

  launch(x: number, y: number, horizontalVelocity = 0, options: ProjectileOptions = {}): void {
    this.enableBody(true, x, y, true, true);
    this.damage = options.damage ?? 1;
    this.remainingHits = 1 + (options.pierce ?? 0);
    this.hitTargets.clear();
    this.explosionRadius = options.explosionRadius ?? 0;
    this.setTint(options.tint ?? COLORS.projectile);
    this.setScale(options.scale ?? 1);
    this.setVelocity(horizontalVelocity, -PROJECTILE_SPEED * (options.speedMultiplier ?? 1));
  }

  isOutsidePlayfield(): boolean {
    return this.active && this.y < -this.displayHeight;
  }

  hit(target: Hittable): boolean {
    if (!this.active || this.hitTargets.has(target)) {
      return false;
    }

    this.hitTargets.add(target);
    target.receiveHit({ damage: this.damage, source: this });
    this.remainingHits -= 1;
    if (this.remainingHits <= 0) this.deactivate();
    return true;
  }

  deactivate(): void {
    this.disableBody(true, true);
  }
}
