import Phaser from "phaser";
import { GAME_WIDTH } from "../constants";
import { Enemy } from "../entities/Enemy";
import { Infantry } from "../entities/Infantry";
import { Scout } from "../entities/Scout";
import { ScoutVeteran } from "../entities/ScoutVeteran";
import { CarrierBoss } from "../entities/CarrierBoss";
import { Bomber } from "../entities/Bomber";
import { SiegeBomberBoss } from "../entities/SiegeBomberBoss";
import { getWaveDefinition, LAST_LEVEL, type EnemyKind, type WaveEnemy } from "./WaveDefinitions";

const START_Y = 94;
const COLUMN_GAP = 68;
const ROW_GAP = 42;
const SIDE_MARGIN = 32;
const DESCENT = 30;
const START_SPEED = 42;
const ELIMINATION_SPEED_BONUS = 2;
const NEXT_WAVE_DELAY_MS = 850;
const MAX_FORMATION_SPEED = 150;

interface PendingEnemySpawn {
  enemy: WaveEnemy;
  x: number;
  y: number;
  remainingMs: number;
}

export class EnemySpawner {
  readonly group: Phaser.Physics.Arcade.Group;

  private direction = 1;
  private wave = 1;
  private nextWaveAt?: number;
  private suspended = false;
  private campaignComplete = false;
  private formationMembers: Enemy[] = [];
  private pendingSpawns: PendingEnemySpawn[] = [];
  private formationTotal = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly onWaveCleared: (completedWave: number) => void,
    private readonly onCampaignComplete: () => void,
  ) {
    this.group = scene.physics.add.group();
  }

  start(time: number): void {
    this.wave = 1;
    this.suspended = false;
    this.campaignComplete = false;
    this.deployFormation(time);
  }

  update(time: number, delta: number): void {
    if (this.suspended || this.campaignComplete) {
      return;
    }
    this.deployPendingEnemies(delta);
    const formationEnemies = this.activeMembers(this.formationMembers);
    const independentEnemies = this.activeEnemies().filter((enemy) => !enemy.usesFormationMovement());
    if (formationEnemies.length === 0 && independentEnemies.length === 0 && this.pendingSpawns.length === 0) {
      this.scheduleOrDeployNextWave(time);
      return;
    }

    for (const enemy of independentEnemies) {
      enemy.updateMovement(time, delta);
    }
    for (const enemy of formationEnemies) {
      enemy.updateMarker(delta);
    }
    for (const enemy of independentEnemies) {
      enemy.updateMarker(delta);
    }

    if (formationEnemies.length === 0) {
      return;
    }

    const speed = this.formationSpeed(formationEnemies.length);
    for (const enemy of formationEnemies) {
      enemy.setVelocityX(this.direction * speed);
    }

    if (!this.hasReachedSide(formationEnemies)) {
      return;
    }

    const horizontalCorrection = this.sideCorrection(formationEnemies);
    this.direction *= -1;
    for (const enemy of formationEnemies) {
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

  skipToWave(wave: number, time: number): void {
    this.eliminateAll();
    this.wave = Phaser.Math.Clamp(Math.floor(wave), 1, LAST_LEVEL);
    this.campaignComplete = false;
    this.deployFormation(time);
  }

  getDebugValues(): { wave: number; activeEnemies: number } {
    return {
      wave: this.wave,
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
    this.formationMembers = [];
    this.pendingSpawns = [];
    this.formationTotal = 0;

    const definition = getWaveDefinition(this.wave);
    const formationWidth = (definition.columns - 1) * COLUMN_GAP;
    const startX = (GAME_WIDTH - formationWidth) / 2;

    definition.enemies.forEach((enemy, index) => {
      const row = enemy.row ?? Math.floor(index / definition.columns);
      const column = enemy.column ?? index % definition.columns;
      const x = startX + column * COLUMN_GAP;
      const y = START_Y + row * ROW_GAP;
      if ((enemy.spawnDelayMs ?? 0) > 0) {
        this.pendingSpawns.push({ enemy, x, y, remainingMs: enemy.spawnDelayMs ?? 0 });
      } else {
        this.spawnEnemy(enemy, x, y);
      }
    });
  }

  private deployPendingEnemies(delta: number): void {
    const waiting: PendingEnemySpawn[] = [];
    for (const pending of this.pendingSpawns) {
      pending.remainingMs -= delta;
      if (pending.remainingMs <= 0) this.spawnEnemy(pending.enemy, pending.x, pending.y);
      else waiting.push(pending);
    }
    this.pendingSpawns = waiting;
  }

  private spawnEnemy({ kind, health }: WaveEnemy, x: number, y: number): void {
    const enemy = this.createEnemy(kind);
    enemy.spawn(x, y, { health });
    if (enemy.usesFormationMovement()) {
      this.formationMembers.push(enemy);
      this.formationTotal += 1;
    }
  }

  private scheduleOrDeployNextWave(time: number): void {
    if (this.nextWaveAt === undefined) {
      if (this.wave >= LAST_LEVEL) {
        this.campaignComplete = true;
        this.onCampaignComplete();
        return;
      }
      this.onWaveCleared(this.wave);
      this.nextWaveAt = time + NEXT_WAVE_DELAY_MS;
      return;
    }

    if (time >= this.nextWaveAt) {
      this.wave += 1;
      this.deployFormation(time);
    }
  }

  private activeEnemies(): Enemy[] {
    return this.group.getChildren().filter((object) => object.active) as Enemy[];
  }

  private activeMembers(members: readonly Enemy[]): Enemy[] {
    return members.filter((enemy) => enemy.active);
  }

  private formationSpeed(activeEnemies: number): number {
    const eliminated = this.formationTotal - activeEnemies;
    const definition = getWaveDefinition(this.wave);
    return Math.min(
      MAX_FORMATION_SPEED,
      (START_SPEED + eliminated * ELIMINATION_SPEED_BONUS) * definition.speedMultiplier,
    );
  }

  private createEnemy(kind: EnemyKind): Enemy {
    const reusable = this.group.getChildren().find(
      (object) => object instanceof Enemy && !object.active && this.matchesKind(object, kind),
    );
    if (reusable instanceof Enemy) {
      return reusable;
    }

    const enemy = this.makeEnemy(kind);
    this.scene.add.existing(enemy);
    this.scene.physics.add.existing(enemy);
    this.group.add(enemy);
    return enemy;
  }

  private matchesKind(enemy: Enemy, kind: EnemyKind): boolean {
    switch (kind) {
      case "scout":
        return enemy instanceof Scout && !(enemy instanceof ScoutVeteran);
      case "scout-veteran":
        return enemy instanceof ScoutVeteran;
      case "infantry":
        return enemy instanceof Infantry;
      case "carrier-boss":
        return enemy instanceof CarrierBoss;
      case "bomber":
        return enemy instanceof Bomber;
      case "siege-bomber-boss":
        return enemy instanceof SiegeBomberBoss;
    }
  }

  private makeEnemy(kind: EnemyKind): Enemy {
    switch (kind) {
      case "scout":
        return new Scout(this.scene);
      case "scout-veteran":
        return new ScoutVeteran(this.scene);
      case "infantry":
        return new Infantry(this.scene);
      case "carrier-boss":
        return new CarrierBoss(this.scene, this.group);
      case "bomber":
        return new Bomber(this.scene, this.group);
      case "siege-bomber-boss":
        return new SiegeBomberBoss(this.scene, this.group);
    }
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
