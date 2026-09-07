import Phaser from "phaser";
import { Enemy } from "../entities/Enemy";
import type { Hit } from "../combat/Hit";
import { showExplosion } from "../graphics/showExplosion";

/** Resolves area damage against the registered combat group. */
export class ExplosionSystem {
  constructor(private readonly scene: Phaser.Scene) {}

  explode(
    position: Phaser.Math.Vector2,
    radius: number,
    hit: Hit,
    targets: Phaser.Physics.Arcade.Group,
    directTarget: Enemy,
  ): void {
    for (const target of targets.getChildren()) {
      if (target instanceof Enemy && target.active && target !== directTarget
        && Phaser.Math.Distance.Between(position.x, position.y, target.x, target.y) <= radius) {
        target.receiveHit(hit);
      }
    }
    showExplosion(this.scene, position.x, position.y, radius);
  }
}
