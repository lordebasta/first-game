import Phaser from "phaser";
import { Projectile, type ProjectileOptions } from "../entities/Projectile";

const SHOT_COOLDOWN_MS = 190;

/** An equipable weapon owned by one player. It owns its projectile pool. */
export class PlayerWeapon {
  readonly projectiles: Phaser.Physics.Arcade.Group;

  private nextShotAt = 0;
  private cooldownMultiplier = 1;
  private projectileSpeedMultiplier = 1;
  private shotCount = 0;
  private readonly areaShotSources = new Map<object, { every: number; count: number; centerDamage: number }>();

  constructor(scene: Phaser.Scene) {
    this.projectiles = scene.physics.add.group({ classType: Projectile });
  }

  tryFire(time: number, origin: Phaser.Math.Vector2): boolean {
    if (time < this.nextShotAt) {
      return false;
    }

    this.shotCount += 1;
    const areaShot = this.getAreaShotConfiguration();
    if (areaShot && this.shotCount % areaShot.every === 0) {
      this.fireAreaShot(time, origin, areaShot);
    } else {
      this.fireFrom(time, origin, 0, { speedMultiplier: this.projectileSpeedMultiplier });
    }
    this.nextShotAt = time + SHOT_COOLDOWN_MS * this.cooldownMultiplier;
    return true;
  }

  fireFrom(_time: number, origin: Phaser.Math.Vector2, horizontalVelocity = 0, options: ProjectileOptions = {}): void {
    const projectile = this.projectiles.get() as Projectile;
    projectile.launch(origin.x, origin.y, horizontalVelocity, options);
  }

  changeCooldownMultiplier(amount: number): void {
    this.cooldownMultiplier += amount;
  }

  changeProjectileSpeedMultiplier(amount: number): void {
    this.projectileSpeedMultiplier += amount;
  }

  setAreaShotSource(source: object, configuration?: { every: number; count: number; centerDamage: number }): void {
    if (configuration) {
      this.areaShotSources.set(source, configuration);
    } else {
      this.areaShotSources.delete(source);
    }
  }

  update(): void {
    for (const object of this.projectiles.getChildren()) {
      const projectile = object as Projectile;
      if (projectile.isOutsidePlayfield()) {
        projectile.deactivate();
      }
    }
  }

  private getAreaShotConfiguration(): { every: number; count: number; centerDamage: number } | undefined {
    const configurations = [...this.areaShotSources.values()];
    if (configurations.length === 0) return undefined;
    return {
      every: Math.min(...configurations.map((configuration) => configuration.every)),
      count: Math.max(...configurations.map((configuration) => configuration.count)),
      centerDamage: Math.max(...configurations.map((configuration) => configuration.centerDamage)),
    };
  }

  private fireAreaShot(
    time: number,
    origin: Phaser.Math.Vector2,
    configuration: { count: number; centerDamage: number },
  ): void {
    const middle = (configuration.count - 1) / 2;
    for (let index = 0; index < configuration.count; index += 1) {
      const centeredIndex = index - middle;
      this.fireFrom(time, origin, centeredIndex * 90, {
        damage: centeredIndex === 0 ? configuration.centerDamage : 1,
        speedMultiplier: this.projectileSpeedMultiplier,
      });
    }
  }
}
