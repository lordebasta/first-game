import Phaser from "phaser";
import type { Hittable } from "../combat/Hittable";
import { Enemy } from "../entities/Enemy";
import { Projectile } from "../entities/Projectile";
import { ExplosionSystem } from "./ExplosionSystem";

export interface ProjectileImpact {
  projectile: Projectile;
  target: Hittable;
  position: Phaser.Math.Vector2;
}

export class CombatSystem {
  private readonly explosions: ExplosionSystem;
  constructor(
    private readonly scene: Phaser.Scene,
    private readonly onProjectileImpact: (impact: ProjectileImpact) => void,
  ) {
    this.explosions = new ExplosionSystem(scene);
  }

  registerProjectileHits(
    projectiles: Phaser.Physics.Arcade.Group,
    hittables: Phaser.Physics.Arcade.Group,
  ): void {
    this.scene.physics.add.overlap(projectiles, hittables, (projectileObject, targetObject) => {
      if (!(projectileObject instanceof Projectile) || !(targetObject instanceof Enemy) || !targetObject.active) return;
      const projectile = projectileObject;
      const target = targetObject;
      const position = new Phaser.Math.Vector2(target.x, target.y);
      if (!projectile.hit(target)) {
        return;
      }

      if (projectile.explosionRadius > 0) {
        this.explosions.explode(position, projectile.explosionRadius,
          { damage: projectile.damage, source: projectile }, hittables, target);
      }

      this.onProjectileImpact({ projectile, target, position });
    });
  }
}
