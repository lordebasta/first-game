import Phaser from "phaser";
import type { Hittable } from "../combat/Hittable";
import { Projectile } from "../entities/Projectile";

export interface ProjectileImpact {
  projectile: Projectile;
  target: Hittable;
  position: Phaser.Math.Vector2;
}

export class CombatSystem {
  constructor(
    private readonly scene: Phaser.Scene,
    private readonly onProjectileImpact: (impact: ProjectileImpact) => void,
  ) {}

  registerProjectileHits(
    projectiles: Phaser.Physics.Arcade.Group,
    hittables: Phaser.Physics.Arcade.Group,
  ): void {
    this.scene.physics.add.overlap(projectiles, hittables, (projectileObject, targetObject) => {
      const projectile = projectileObject as Projectile;
      const target = targetObject as unknown as Hittable;
      const position = new Phaser.Math.Vector2(target.x, target.y);
      if (!projectile.hit(target)) {
        return;
      }

      this.onProjectileImpact({ projectile, target, position });
    });
  }
}
