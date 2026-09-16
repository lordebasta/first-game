import Phaser from "phaser";
import type { Hit } from "../combat/Hit";
import { showExplosion } from "../graphics/showExplosion";
import { Sapper, type SapperProfile } from "./Sapper";

const BOSS_HEALTH = 24;
const HEALTH_BAR_WIDTH = 100;
const BOSS_COLOR = 0xff9f43;
const BOSS_PROFILE: SapperProfile = {
  texture: "sapper-boss",
  health: BOSS_HEALTH,
  usesHealthColors: false,
  lockDelayMs: 1_200,
  diveSpeed: 75,
  teleports: 3,
  teleportIntervalMs: 650,
};

/** A larger Sapper that teleports between lanes before committing to its dive. */
export class SapperBoss extends Sapper {
  private readonly healthBarBackground: Phaser.GameObjects.Rectangle;
  private readonly healthBar: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene) {
    super(scene, BOSS_PROFILE);
    this.healthBarBackground = scene.add.rectangle(0, 0, HEALTH_BAR_WIDTH, 7, 0x351124).setDepth(2);
    this.healthBar = scene.add.rectangle(0, 0, HEALTH_BAR_WIDTH, 5, BOSS_COLOR).setOrigin(0, 0.5).setDepth(3);
  }

  protected override onSpawn(): void {
    super.onSpawn();
    this.setTint(BOSS_COLOR);
    this.healthBarBackground.setVisible(true);
    this.healthBar.setVisible(true);
    this.refreshHealthBar();
  }

  override updateMovement(time: number, delta: number): void {
    super.updateMovement(time, delta);
    this.positionHealthBar();
  }

  override receiveHit(hit: Hit): void {
    const wasActive = this.active;
    super.receiveHit(hit);
    this.refreshHealthBar();
    if (wasActive && !this.active) showExplosion(this.scene, this.x, this.y, 76);
  }

  override deactivate(): void {
    super.deactivate();
    this.healthBarBackground.setVisible(false);
    this.healthBar.setVisible(false);
  }

  private refreshHealthBar(): void {
    this.healthBar.displayWidth = HEALTH_BAR_WIDTH * Math.max(0, this.getHealth()) / BOSS_HEALTH;
    this.positionHealthBar();
  }

  private positionHealthBar(): void {
    const y = this.y - this.displayHeight / 2 - 12;
    this.healthBarBackground.setPosition(this.x, y);
    this.healthBar.setPosition(this.x - HEALTH_BAR_WIDTH / 2, y);
  }
}
