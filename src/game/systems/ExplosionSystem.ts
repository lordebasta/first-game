import Phaser from "phaser";
import { Enemy } from "../entities/Enemy";
import type { Hit } from "../combat/Hit";
import { showExplosion } from "../graphics/showExplosion";

/** Resolves area damage against active enemies discovered in the physics world. */
export class ExplosionSystem {
  constructor(private readonly scene: Phaser.Scene) {}

  explode(
    position: Phaser.Math.Vector2,
    radius: number,
    hit: Hit,
    directTarget: Enemy,
  ): void {
    for (const body of this.scene.physics.overlapCirc(position.x, position.y, radius)) {
      const target = body.gameObject;
      if (target instanceof Enemy && target.active && target !== directTarget) {
        target.receiveHit(hit);
      }
    }
    showExplosion(this.scene, position.x, position.y, radius);
  }
}
