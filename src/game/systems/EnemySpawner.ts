import Phaser from "phaser";
import { GAME_WIDTH } from "../constants";
import { Enemy } from "../entities/Enemy";

const SPAWN_Y = 78;
const START_SPEED = 58;
const MAX_SPEED = 235;
const START_DELAY_MS = 920;
const MIN_DELAY_MS = 300;

export class EnemySpawner {
  readonly group: Phaser.Physics.Arcade.Group;

  private startedAt = 0;
  private nextSpawnAt = 0;

  constructor(scene: Phaser.Scene) {
    this.group = scene.physics.add.group({ classType: Enemy });
  }

  start(time: number): void {
    this.startedAt = time;
    this.nextSpawnAt = time + 450;
  }

  update(time: number): void {
    if (time < this.nextSpawnAt) {
      return;
    }

    const elapsedSeconds = (time - this.startedAt) / 1000;
    const speed = Math.min(START_SPEED + elapsedSeconds * 2.25, MAX_SPEED);
    const delay = Math.max(START_DELAY_MS - elapsedSeconds * 9, MIN_DELAY_MS);
    const x = Phaser.Math.Between(55, GAME_WIDTH - 55);
    const enemy = this.group.get() as Enemy;

    enemy.spawn(x, SPAWN_Y, speed);
    this.nextSpawnAt = time + delay;
  }

  hasEnemyReached(y: number): boolean {
    return this.group.getChildren().some((object) => (object as Enemy).hasReached(y));
  }
}
