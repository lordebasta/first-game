import Phaser from "phaser";
import { GAME_WIDTH } from "../constants";
import { Enemy } from "../entities/Enemy";

const ROWS = 5;
const COLUMNS = 8;
const START_X = 122;
const START_Y = 94;
const COLUMN_GAP = 68;
const ROW_GAP = 42;
const SIDE_MARGIN = 32;
const DESCENT = 30;
const START_SPEED = 42;
const WAVE_SPEED_BONUS = 8;
const ELIMINATION_SPEED_BONUS = 2;
const NEXT_WAVE_DELAY_MS = 850;

export class EnemySpawner {
  readonly group: Phaser.Physics.Arcade.Group;

  private direction = 1;
  private wave = 0;
  private nextWaveAt?: number;
  private suspended = false;

  constructor(
    scene: Phaser.Scene,
    private readonly onWaveCleared: (completedWaves: number) => void,
  ) {
    this.group = scene.physics.add.group({ classType: Enemy });
  }

  start(time: number): void {
    this.wave = 0;
    this.suspended = false;
    this.deployFormation(time);
  }

  update(time: number): void {
    if (this.suspended) {
      return;
    }
    const enemies = this.activeEnemies();
    if (enemies.length === 0) {
      this.scheduleOrDeployNextWave(time);
      return;
    }

    const speed = this.formationSpeed(enemies.length);
    for (const enemy of enemies) {
      enemy.setVelocityX(this.direction * speed);
    }

    if (!this.hasReachedSide(enemies)) {
      return;
    }

    const horizontalCorrection = this.sideCorrection(enemies);
    this.direction *= -1;
    for (const enemy of enemies) {
      enemy.moveBy(horizontalCorrection, DESCENT);
      enemy.setVelocityX(this.direction * speed);
    }
  }

  hasEnemyReached(y: number): boolean {
    return this.group.getChildren().some((object) => (object as Enemy).hasReached(y));
  }

  eliminateAll(): void {
    for (const enemy of this.activeEnemies()) {
      enemy.deactivate();
    }
  }

  getDebugValues(): { wave: number; activeEnemies: number } {
    return {
      wave: this.wave + 1,
      activeEnemies: this.activeEnemies().length,
    };
  }

  setSuspended(value: boolean): void {
    this.suspended = value;
    if (value) {
      for (const enemy of this.activeEnemies()) {
        enemy.setVelocity(0, 0);
      }
    }
  }

  private deployFormation(_time: number): void {
    this.direction = 1;
    this.nextWaveAt = undefined;

    for (let row = 0; row < ROWS; row += 1) {
      for (let column = 0; column < COLUMNS; column += 1) {
        const enemy = this.group.get() as Enemy;
        enemy.spawn(START_X + column * COLUMN_GAP, START_Y + row * ROW_GAP);
      }
    }
  }

  private scheduleOrDeployNextWave(time: number): void {
    if (this.nextWaveAt === undefined) {
      this.nextWaveAt = time + NEXT_WAVE_DELAY_MS;
      return;
    }

    if (time >= this.nextWaveAt) {
      this.wave += 1;
      this.onWaveCleared(this.wave);
      this.deployFormation(time);
    }
  }

  private activeEnemies(): Enemy[] {
    return this.group.getChildren().filter((object) => object.active) as Enemy[];
  }

  private formationSpeed(activeEnemies: number): number {
    const eliminated = ROWS * COLUMNS - activeEnemies;
    return START_SPEED + this.wave * WAVE_SPEED_BONUS + eliminated * ELIMINATION_SPEED_BONUS;
  }

  private hasReachedSide(enemies: Enemy[]): boolean {
    const left = Math.min(...enemies.map((enemy) => enemy.x - enemy.displayWidth / 2));
    const right = Math.max(...enemies.map((enemy) => enemy.x + enemy.displayWidth / 2));
    return this.direction > 0 ? right >= GAME_WIDTH - SIDE_MARGIN : left <= SIDE_MARGIN;
  }

  private sideCorrection(enemies: Enemy[]): number {
    const left = Math.min(...enemies.map((enemy) => enemy.x - enemy.displayWidth / 2));
    const right = Math.max(...enemies.map((enemy) => enemy.x + enemy.displayWidth / 2));
    return this.direction > 0 ? GAME_WIDTH - SIDE_MARGIN - right : SIDE_MARGIN - left;
  }
}
