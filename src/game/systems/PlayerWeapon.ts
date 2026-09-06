import Phaser from "phaser";
import { Projectile } from "../entities/Projectile";

const SHOT_COOLDOWN_MS = 190;

/** An equipable weapon owned by one player. It owns its projectile pool. */
export class PlayerWeapon {
  readonly projectiles: Phaser.Physics.Arcade.Group;

  private nextShotAt = 0;
  private cooldownMultiplier = 1;

  constructor(scene: Phaser.Scene) {
    this.projectiles = scene.physics.add.group({ classType: Projectile });
  }

  tryFire(time: number, origin: Phaser.Math.Vector2): boolean {
    if (time < this.nextShotAt) {
      return false;
    }

    this.fireFrom(time, origin);
    this.nextShotAt = time + SHOT_COOLDOWN_MS * this.cooldownMultiplier;
    return true;
  }

  fireFrom(_time: number, origin: Phaser.Math.Vector2): void {
    const projectile = this.projectiles.get() as Projectile;
    projectile.launch(origin.x, origin.y);
  }

  changeCooldownMultiplier(amount: number): void {
    this.cooldownMultiplier += amount;
  }

  update(): void {
    for (const object of this.projectiles.getChildren()) {
      const projectile = object as Projectile;
      if (projectile.isOutsidePlayfield()) {
        projectile.deactivate();
      }
    }
  }
}
