import Phaser from "phaser";
import { GAME_WIDTH } from "../constants";
import type { Hit } from "../combat/Hit";
import { Enemy, type EnemyDefinition } from "./Enemy";
import { Scout } from "./Scout";
import { ScoutVeteran } from "./ScoutVeteran";

const BOSS_HEALTH = 60;
const HORIZONTAL_SPEED = 92;
const SIDE_MARGIN = 72;
const FIRST_DROP_DELAY_MS = 1_600;
const DROP_INTERVAL_MS = 1_800;
const HEALTH_BAR_WIDTH = 108;
const BOSS_COLOR = 0xffdc57;

const CARRIER_DEFINITION: EnemyDefinition = {
  texture: "carrier-boss",
  health: BOSS_HEALTH,
};

/** Wave-ten boss: patrols the upper playfield and periodically deploys Scouts. */
export class CarrierBoss extends Enemy {
  private direction = 1;
  private elapsed = 0;
  private nextDropAt = FIRST_DROP_DELAY_MS;
  private readonly healthBarBackground: Phaser.GameObjects.Rectangle;
  private readonly healthBar: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, private readonly enemyGroup: Phaser.Physics.Arcade.Group) {
    super(scene, 0, 0, CARRIER_DEFINITION);
    this.healthBarBackground = scene.add.rectangle(0, 0, HEALTH_BAR_WIDTH, 7, 0x351124).setDepth(2);
    this.healthBar = scene.add.rectangle(0, 0, HEALTH_BAR_WIDTH, 5, 0xffdc57).setOrigin(0, 0.5).setDepth(3);
  }

  protected override onSpawn(): void {
    this.direction = 1;
    this.elapsed = 0;
    this.nextDropAt = FIRST_DROP_DELAY_MS;
    this.healthBarBackground.setVisible(true);
    this.healthBar.setVisible(true);
    this.setTint(BOSS_COLOR);
    this.refreshHealthBar();
  }

  override usesFormationMovement(): boolean {
    return false;
  }

  override updateMovement(_time: number, delta: number): void {
    this.elapsed += delta;
    const nextX = this.x + this.direction * HORIZONTAL_SPEED * delta / 1_000;
    if (nextX <= SIDE_MARGIN || nextX >= GAME_WIDTH - SIDE_MARGIN) {
      this.direction *= -1;
    }
    this.setX(Phaser.Math.Clamp(nextX, SIDE_MARGIN, GAME_WIDTH - SIDE_MARGIN));
    this.body?.reset(this.x, this.y);
    this.positionHealthBar();

    while (this.elapsed >= this.nextDropAt) {
      this.deployScout();
      this.nextDropAt += DROP_INTERVAL_MS;
    }
  }

  override receiveHit(hit: Hit): void {
    super.receiveHit(hit);
    this.setTint(BOSS_COLOR);
    this.refreshHealthBar();
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

  private positionHealthBar(): void {
    const y = this.y - this.displayHeight / 2 - 12;
    this.healthBarBackground.setPosition(this.x, y);
    this.healthBar.setPosition(this.x - HEALTH_BAR_WIDTH / 2, y);
  }
}
