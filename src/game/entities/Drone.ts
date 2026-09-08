import Phaser from "phaser";
import { COLORS } from "../constants";
import { Enemy } from "./Enemy";
import { PlayerWeapon } from "../systems/PlayerWeapon";

const DRONE_Y = 530;
const MOVE_SPEED = 260;
const SHOT_INTERVAL_MS = 1_100;

export interface DroneUpdateOptions {
  laser: boolean;
  priority: "lowest" | "strongest";
  fireRateMultiplier: number;
}

/** Autonomous support unit created by a Drone Factory. It has no physics body. */
export class Drone extends Phaser.GameObjects.Container {
  private nextShotAt = 0;

  constructor(scene: Phaser.Scene, x: number, private readonly weapon: PlayerWeapon) {
    const body = scene.add.circle(0, 0, 13, COLORS.accent).setStrokeStyle(2, COLORS.player);
    const eye = scene.add.circle(0, -1, 4, COLORS.background);
    super(scene, x, DRONE_Y, [body, eye]);
    scene.add.existing(this);
  }

  update(time: number, enemies: readonly Enemy[], options: DroneUpdateOptions): void {
    const target = options.priority === "strongest" ? this.strongestEnemy(enemies) : this.lowestEnemy(enemies);
    if (!target) {
      return;
    }

    const distance = target.x - this.x;
    this.x += Math.sign(distance) * Math.min(Math.abs(distance), MOVE_SPEED / 60);
    if (time < this.nextShotAt) {
      return;
    }
    if (options.laser) {
      target.receiveHit({ damage: 1, source: this });
      const beam = this.scene.add.line(0, 0, this.x, this.y - 18, target.x, target.y, 0x9fe7ff, 0.9)
        .setOrigin(0)
        .setLineWidth(2);
      this.scene.tweens.add({ targets: beam, alpha: 0, duration: 120, onComplete: () => beam.destroy() });
    } else {
      this.weapon.fireFrom(time, new Phaser.Math.Vector2(this.x, this.y - 18), 0, {
        tint: 0x9fe7ff,
        scale: 0.78,
      });
    }
    this.nextShotAt = time + SHOT_INTERVAL_MS * options.fireRateMultiplier;
  }

  private lowestEnemy(enemies: readonly Enemy[]): Enemy | undefined {
    return enemies.reduce<Enemy | undefined>((lowest, enemy) => (!lowest || enemy.y > lowest.y ? enemy : lowest), undefined);
  }

  private strongestEnemy(enemies: readonly Enemy[]): Enemy | undefined {
    return enemies.reduce<Enemy | undefined>((strongest, enemy) =>
      !strongest || enemy.getHealth() > strongest.getHealth() ? enemy : strongest, undefined);
  }
}
