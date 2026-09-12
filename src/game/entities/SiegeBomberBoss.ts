import Phaser from "phaser";
import { GAME_WIDTH } from "../constants";
import type { Hit } from "../combat/Hit";
import { showExplosion } from "../graphics/showExplosion";
import { Enemy, type EnemyDefinition } from "./Enemy";
import { Bomb } from "./Bomb";
import { Scout } from "./Scout";
import { ScoutVeteran } from "./ScoutVeteran";

const BOSS_HEALTH = 90;
const HARDPOINT_HEALTH = 18;
const HORIZONTAL_SPEED = 64;
const SIDE_MARGIN = 122;
const HARDPOINT_OFFSET_X = 83;
const DROP_INTERVAL_MS = 2_500;
const SCOUT_INTERVAL_MS = 2_900;
const HARDPOINT_BURST_COUNT = 3;
const HARDPOINT_BURST_INTERVAL_MS = 240;
const FRENZY_DURATION_MS = 10_000;
const FRENZY_INTERVAL_MS = 650;
const TELEPORT_VANISH_MS = 120;
const TELEPORT_APPEAR_MS = 140;
const HEALTH_BAR_WIDTH = 190;
const HARDPOINT_HEALTH_BAR_WIDTH = 50;

const BOSS_DEFINITION: EnemyDefinition = { texture: "siege-bomber-boss", health: BOSS_HEALTH };
const HARDPOINT_DEFINITION: EnemyDefinition = {
  texture: "boss-hardpoint",
  health: HARDPOINT_HEALTH,
  usesHealthColors: false,
};

class BossHardpoint extends Enemy {
  private readonly healthBarBackground: Phaser.GameObjects.Rectangle;
  private readonly healthBar: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, readonly side: -1 | 1) {
    super(scene, 0, 0, HARDPOINT_DEFINITION);
    this.healthBarBackground = scene.add.rectangle(0, 0, HARDPOINT_HEALTH_BAR_WIDTH, 6, 0x351124).setDepth(2);
    this.healthBar = scene.add.rectangle(0, 0, HARDPOINT_HEALTH_BAR_WIDTH, 4, 0xff5470).setOrigin(0, 0.5).setDepth(3);
  }

  protected override onSpawn(): void {
    this.setTint(0xff5470);
    this.setDepth(1);
    this.healthBarBackground.setVisible(true);
    this.healthBar.setVisible(true);
    this.refreshHealthBar();
  }

  override usesFormationMovement(): boolean {
    return false;
  }

  override receiveHit(hit: Hit): void {
    const wasActive = this.active;
    super.receiveHit(hit);
    this.refreshHealthBar();
    if (wasActive && !this.active) showExplosion(this.scene, this.x, this.y, 68);
  }

  override deactivate(): void {
    super.deactivate();
    this.healthBarBackground.setVisible(false);
    this.healthBar.setVisible(false);
  }

  positionAt(x: number, y: number): void {
    this.setPosition(x, y);
    this.body?.reset(x, y);
    this.positionHealthBar();
  }

  private refreshHealthBar(): void {
    this.healthBar.displayWidth = HARDPOINT_HEALTH_BAR_WIDTH * Math.max(0, this.getHealth()) / HARDPOINT_HEALTH;
    this.positionHealthBar();
  }

  private positionHealthBar(): void {
    const y = this.y - this.displayHeight / 2 - 8;
    this.healthBarBackground.setPosition(this.x, y);
    this.healthBar.setPosition(this.x - HARDPOINT_HEALTH_BAR_WIDTH / 2, y);
  }
}

/** Wave-fifteen gate boss: destroy both bomb hardpoints before its hull can take damage. */
export class SiegeBomberBoss extends Enemy {
  private direction = 1;
  private elapsed = 0;
  private nextBombAt = 1_100;
  private nextScoutAt = 2_000;
  private activeHardpointCount = 2;
  private burstScoutsRemaining = 0;
  private nextBurstScoutAt = Number.POSITIVE_INFINITY;
  private frenzyStartedAt?: number;
  private nextFrenzyAttackAt = Number.POSITIVE_INFINITY;
  private teleporting = false;
  private frenzyDropsScout = true;
  private readonly hardpoints: readonly [BossHardpoint, BossHardpoint];
  private readonly healthBarBackground: Phaser.GameObjects.Rectangle;
  private readonly healthBar: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, private readonly enemyGroup: Phaser.Physics.Arcade.Group) {
    super(scene, 0, 0, BOSS_DEFINITION);
    this.hardpoints = [new BossHardpoint(scene, -1), new BossHardpoint(scene, 1)];
    for (const hardpoint of this.hardpoints) {
      scene.add.existing(hardpoint);
      scene.physics.add.existing(hardpoint);
      enemyGroup.add(hardpoint);
      hardpoint.deactivate();
    }
    this.healthBarBackground = scene.add.rectangle(0, 0, HEALTH_BAR_WIDTH, 8, 0x351124).setDepth(2);
    this.healthBar = scene.add.rectangle(0, 0, HEALTH_BAR_WIDTH, 6, 0x9fe7ff).setOrigin(0, 0.5).setDepth(3);
  }

  protected override onSpawn(x: number, y: number): void {
    this.direction = 1;
    this.elapsed = 0;
    this.nextBombAt = 1_100;
    this.nextScoutAt = 2_000;
    this.activeHardpointCount = this.hardpoints.length;
    this.burstScoutsRemaining = 0;
    this.nextBurstScoutAt = Number.POSITIVE_INFINITY;
    this.frenzyStartedAt = undefined;
    this.nextFrenzyAttackAt = Number.POSITIVE_INFINITY;
    this.teleporting = false;
    this.frenzyDropsScout = true;
    this.setTint(0x428dff);
    for (const hardpoint of this.hardpoints) hardpoint.spawn(x + hardpoint.side * HARDPOINT_OFFSET_X, y);
    this.healthBarBackground.setVisible(true);
    this.healthBar.setVisible(true);
    this.healthBarBackground.setAlpha(1);
    this.healthBar.setAlpha(1);
    this.refreshHealthBar();
    this.positionParts();
  }

  override usesFormationMovement(): boolean {
    return false;
  }

  override canBeTargetedAutomatically(): boolean {
    return this.active && !this.hardpoints.some((hardpoint) => hardpoint.active);
  }

  override updateMovement(_time: number, delta: number): void {
    this.elapsed += delta;
    this.updateHardpointPhase();

    if (this.isFrenzied()) {
      this.runFrenzy();
    } else {
      const nextX = this.x + this.direction * HORIZONTAL_SPEED * delta / 1_000;
      if (nextX <= SIDE_MARGIN || nextX >= GAME_WIDTH - SIDE_MARGIN) this.direction *= -1;
      this.setX(Phaser.Math.Clamp(nextX, SIDE_MARGIN, GAME_WIDTH - SIDE_MARGIN));
      this.body?.reset(this.x, this.y);
    }
    this.positionParts();

    while (this.elapsed >= this.nextBombAt) {
      for (const hardpoint of this.hardpoints) {
        if (hardpoint.active) this.dropBomb(hardpoint.x, hardpoint.y + 25);
      }
      this.nextBombAt += DROP_INTERVAL_MS;
    }
    while (this.burstScoutsRemaining > 0 && this.elapsed >= this.nextBurstScoutAt) {
      this.deployScout();
      this.burstScoutsRemaining -= 1;
      this.nextBurstScoutAt += HARDPOINT_BURST_INTERVAL_MS;
    }
    while (!this.isFrenzied() && this.elapsed >= this.nextScoutAt) {
      this.deployScout();
      this.nextScoutAt += SCOUT_INTERVAL_MS;
    }
  }

  override receiveHit(hit: Hit): void {
    if (this.hardpoints.some((hardpoint) => hardpoint.active)) {
      this.scene.tweens.add({ targets: this, alpha: 0.35, yoyo: true, duration: 70 });
      return;
    }
    const wasActive = this.active;
    super.receiveHit(hit);
    this.setTint(0x428dff);
    this.refreshHealthBar();
    if (wasActive && !this.active) this.explodeHull();
  }

  override deactivate(): void {
    super.deactivate();
    this.healthBarBackground.setVisible(false);
    this.healthBar.setVisible(false);
    for (const hardpoint of this.hardpoints) {
      if (hardpoint.active) hardpoint.deactivate();
    }
  }

  private positionParts(): void {
    for (const hardpoint of this.hardpoints) {
      if (!hardpoint.active) continue;
      hardpoint.positionAt(this.x + hardpoint.side * HARDPOINT_OFFSET_X, this.y + 10);
    }
    const barY = this.y - this.displayHeight / 2 - 15;
    this.healthBarBackground.setPosition(this.x, barY);
    this.healthBar.setPosition(this.x - HEALTH_BAR_WIDTH / 2, barY);
  }

  private refreshHealthBar(): void {
    this.healthBar.displayWidth = HEALTH_BAR_WIDTH * Math.max(0, this.getHealth()) / BOSS_HEALTH;
    this.positionParts();
  }

  private updateHardpointPhase(): void {
    const activeCount = this.hardpoints.filter((hardpoint) => hardpoint.active).length;
    if (activeCount >= this.activeHardpointCount) return;

    if (this.activeHardpointCount === 2 && activeCount <= 1) {
      this.burstScoutsRemaining += HARDPOINT_BURST_COUNT;
      this.nextBurstScoutAt = Math.min(this.nextBurstScoutAt, this.elapsed);
    }
    if (activeCount === 0 && this.activeHardpointCount > 0) {
      this.frenzyStartedAt = this.elapsed;
      this.nextFrenzyAttackAt = this.elapsed;
      this.nextScoutAt = this.elapsed + FRENZY_DURATION_MS + SCOUT_INTERVAL_MS;
    }
    this.activeHardpointCount = activeCount;
  }

  private isFrenzied(): boolean {
    return this.frenzyStartedAt !== undefined && this.elapsed - this.frenzyStartedAt < FRENZY_DURATION_MS;
  }

  private runFrenzy(): void {
    const frenzyEndsAt = (this.frenzyStartedAt ?? this.elapsed) + FRENZY_DURATION_MS;
    if (this.teleporting || this.elapsed < this.nextFrenzyAttackAt || this.nextFrenzyAttackAt >= frenzyEndsAt) return;
    this.nextFrenzyAttackAt += FRENZY_INTERVAL_MS;
    this.animateTeleportAttack();
  }

  private animateTeleportAttack(): void {
    this.teleporting = true;
    const targets = [this, this.healthBarBackground, this.healthBar];
    this.scene.tweens.add({
      targets,
      alpha: 0,
      duration: TELEPORT_VANISH_MS,
      ease: "Quad.easeIn",
      onComplete: () => {
        if (!this.active) {
          this.teleporting = false;
          return;
        }
        this.teleportToAnotherX();
        if (this.frenzyDropsScout) {
          this.deployScout();
        } else {
          this.dropBomb(this.x, this.y + this.displayHeight / 2 + 12);
        }
        this.frenzyDropsScout = !this.frenzyDropsScout;
        this.positionParts();
        this.scene.tweens.add({
          targets,
          alpha: 1,
          duration: TELEPORT_APPEAR_MS,
          ease: "Quad.easeOut",
          onComplete: () => { this.teleporting = false; },
        });
      },
    });
  }

  private teleportToAnotherX(): void {
    const destinations = [
      SIDE_MARGIN,
      GAME_WIDTH * 0.3,
      GAME_WIDTH * 0.5,
      GAME_WIDTH * 0.7,
      GAME_WIDTH - SIDE_MARGIN,
    ].filter((x) => Math.abs(x - this.x) >= 100);
    this.setX(Phaser.Utils.Array.GetRandom(destinations));
    this.body?.reset(this.x, this.y);
  }

  private dropBomb(x: number, y: number): void {
    const reusable = this.enemyGroup.getChildren().find((object) => object instanceof Bomb && !object.active);
    const bomb = reusable instanceof Bomb ? reusable : new Bomb(this.scene);
    if (!reusable) {
      this.scene.add.existing(bomb);
      this.scene.physics.add.existing(bomb);
      this.enemyGroup.add(bomb);
    }
    bomb.spawn(x, y, { health: 4 });
  }

  private deployScout(): void {
    const reusable = this.enemyGroup.getChildren().find(
      (object) => object instanceof Scout && !(object instanceof ScoutVeteran) && !object.active,
    );
    const scout = reusable instanceof Scout ? reusable : new Scout(this.scene);
    if (!reusable) {
      this.scene.add.existing(scout);
      this.scene.physics.add.existing(scout);
      this.enemyGroup.add(scout);
    }
    scout.spawn(this.x, this.y + this.displayHeight / 2 + 18, { health: 2 });
  }

  private explodeHull(): void {
    const x = this.x;
    const y = this.y;
    showExplosion(this.scene, x, y, 86);
    this.scene.time.delayedCall(110, () => showExplosion(this.scene, x - 62, y + 4, 58));
    this.scene.time.delayedCall(220, () => showExplosion(this.scene, x + 62, y - 3, 58));
  }
}
