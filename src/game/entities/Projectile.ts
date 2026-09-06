import Phaser from "phaser";
import type { Hittable } from "../combat/Hittable";

const PROJECTILE_SPEED = 620;

export class Projectile extends Phaser.Physics.Arcade.Sprite {
  readonly damage = 1;

  constructor(scene: Phaser.Scene, x = 0, y = 0) {
    super(scene, x, y, "projectile");
  }

  launch(x: number, y: number, horizontalVelocity = 0): void {
    this.enableBody(true, x, y, true, true);
    this.setVelocity(horizontalVelocity, -PROJECTILE_SPEED);
  }

  isOutsidePlayfield(): boolean {
    return this.active && this.y < -this.displayHeight;
  }

  hit(target: Hittable): boolean {
    if (!this.active) {
      return false;
    }

    target.receiveHit({ damage: this.damage, source: this });
    this.deactivate();
    return true;
  }

  deactivate(): void {
    this.disableBody(true, true);
  }
}
