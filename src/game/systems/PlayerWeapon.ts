import Phaser from "phaser";
import { Projectile } from "../entities/Projectile";

const SHOT_COOLDOWN_MS = 190;

/** An equipable weapon owned by one player. It owns its projectile pool. */
export class PlayerWeapon {
  readonly projectiles: Phaser.Physics.Arcade.Group;

  private nextShotAt = 0;

  constructor(scene: Phaser.Scene) {
    this.projectiles = scene.physics.add.group({ classType: Projectile });
  }

  tryFire(time: number, origin: Phaser.Math.Vector2): boolean {
    if (time < this.nextShotAt) {
      return false;
    }

    const projectile = this.projectiles.get() as Projectile;
    projectile.launch(origin.x, origin.y);
    this.nextShotAt = time + SHOT_COOLDOWN_MS;
    return true;
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
