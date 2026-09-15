import Phaser from "phaser";
import { COLORS } from "../constants";
import { Enemy } from "./Enemy";
import { Bomb } from "./Bomb";
import { playLaserSound } from "../audio/SoundEffects";

const DRONE_Y = 530;
const MOVE_SPEED = 260;
const SHOT_INTERVAL_MS = 1_100;
const TARGET_CANDIDATE_COUNT = 3;

export interface DroneUpdateOptions {
  doubleLaser: boolean;
  fireRateMultiplier: number;
  bombHunter: boolean;
  reservedBombs: Set<Bomb>;
}

/** Autonomous support unit created by a Drone Factory. It has no physics body. */
export class Drone extends Phaser.GameObjects.Container {
  private nextShotAt = 0;
  private attackCount = 0;
  private target?: Enemy;

  constructor(scene: Phaser.Scene, x: number) {
    const body = scene.add.circle(0, 0, 13, COLORS.accent).setStrokeStyle(2, COLORS.player);
    const eye = scene.add.circle(0, -1, 4, COLORS.background);
    super(scene, x, DRONE_Y, [body, eye]);
    scene.add.existing(this);
  }

  update(time: number, enemies: readonly Enemy[], options: DroneUpdateOptions): void {
    const targetableEnemies = enemies.filter((enemy) => enemy.canBeTargetedAutomatically());
    const targetClaimedByAnotherDrone = this.target instanceof Bomb && options.reservedBombs.has(this.target);
    const mustSwitchToBomb = options.bombHunter
      && !(this.target instanceof Bomb)
      && targetableEnemies.some((enemy) => enemy instanceof Bomb && !options.reservedBombs.has(enemy));
    if (!this.target?.canBeTargetedAutomatically()
      || !targetableEnemies.includes(this.target)
      || targetClaimedByAnotherDrone
      || mustSwitchToBomb) {
      this.target = this.chooseTarget(targetableEnemies, options.bombHunter, options.reservedBombs);
    }
    const target = this.target;
    if (!target) {
      return;
    }
    if (target instanceof Bomb) options.reservedBombs.add(target);

    const distance = target.x - this.x;
    this.x += Math.sign(distance) * Math.min(Math.abs(distance), MOVE_SPEED / 60);
    if (time < this.nextShotAt) {
      return;
    }

    this.attackCount += 1;
    const targets = [target];
    if (options.doubleLaser && this.attackCount % 2 === 0) {
      const secondTarget = this.chooseTarget(
        targetableEnemies.filter((enemy) => enemy !== target),
        options.bombHunter,
        options.reservedBombs,
      );
      if (secondTarget) {
        targets.push(secondTarget);
        if (secondTarget instanceof Bomb) options.reservedBombs.add(secondTarget);
      }
    }

    for (const laserTarget of targets) this.fireLaser(laserTarget, options.bombHunter);
    playLaserSound(this.scene);
    this.nextShotAt = time + SHOT_INTERVAL_MS * options.fireRateMultiplier;
    this.target = undefined;
  }

  private chooseTarget(
    enemies: readonly Enemy[],
    prioritizeBombs: boolean,
    reservedBombs: ReadonlySet<Bomb>,
  ): Enemy | undefined {
    const availableEnemies = enemies.filter((enemy) => !(enemy instanceof Bomb && reservedBombs.has(enemy)));
    if (prioritizeBombs) {
      const closestBomb = availableEnemies
        .filter((enemy): enemy is Bomb => enemy instanceof Bomb)
        .sort((first, second) => second.y - first.y)[0];
      if (closestBomb) return closestBomb;
    }
    const candidates = [...availableEnemies]
      .sort((first, second) => second.y - first.y)
      .slice(0, TARGET_CANDIDATE_COUNT);
    return candidates.length > 0 ? Phaser.Utils.Array.GetRandom(candidates) : undefined;
  }

  private fireLaser(target: Enemy, bombHunter: boolean): void {
    target.receiveHit({ damage: 1 + (bombHunter && target instanceof Bomb ? 1 : 0), source: this });
    const beam = this.scene.add.line(0, 0, this.x, this.y - 18, target.x, target.y, 0x9fe7ff, 0.9)
      .setOrigin(0)
      .setLineWidth(2);
    this.scene.tweens.add({ targets: beam, alpha: 0, duration: 120, onComplete: () => beam.destroy() });
  }
}
