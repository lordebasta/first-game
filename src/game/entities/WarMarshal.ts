import Phaser from "phaser";
import type { Hit } from "../combat/Hit";
import { showExplosion } from "../graphics/showExplosion";
import { Enemy, type EnemyDefinition } from "./Enemy";

const BOSS_HEALTH = 55;
const HEALTH_BAR_WIDTH = 132;
const BOSS_COLOR = 0xff8a4c;
const DESCENT_MULTIPLIER = 1.4;

const WAR_MARSHAL_DEFINITION: EnemyDefinition = {
  texture: "war-marshal",
  health: BOSS_HEALTH,
  usesHealthColors: false,
};

/** Wave-twenty commander: accelerates formation descents and calls armor at half health. */
export class WarMarshal extends Enemy {
  private reinforcementsCalled = false;
  private readonly healthBarBackground: Phaser.GameObjects.Rectangle;
  private readonly healthBar: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, private readonly callReinforcements: (marshal: WarMarshal) => void) {
    super(scene, 0, 0, WAR_MARSHAL_DEFINITION);
    this.healthBarBackground = scene.add.rectangle(0, 0, HEALTH_BAR_WIDTH, 7, 0x351124).setDepth(2);
    this.healthBar = scene.add.rectangle(0, 0, HEALTH_BAR_WIDTH, 5, BOSS_COLOR).setOrigin(0, 0.5).setDepth(3);
  }

  protected override onSpawn(): void {
    this.reinforcementsCalled = false;
    this.setTint(BOSS_COLOR);
    this.healthBarBackground.setVisible(true);
    this.healthBar.setVisible(true);
    this.refreshHealthBar();
  }

  override formationDescentMultiplier(): number {
    return DESCENT_MULTIPLIER;
  }

  override updateMarker(delta: number): void {
    super.updateMarker(delta);
    this.positionHealthBar();
  }

  override moveBy(x: number, y: number): void {
    super.moveBy(x, y);
    this.positionHealthBar();
  }

  override receiveHit(hit: Hit): void {
    const healthBefore = this.getHealth();
    const wasActive = this.active;
    super.receiveHit(hit);
    this.setTint(BOSS_COLOR);
    this.refreshHealthBar();
    if (!this.reinforcementsCalled && healthBefore > BOSS_HEALTH / 2 && this.getHealth() <= BOSS_HEALTH / 2) {
      this.reinforcementsCalled = true;
      this.showReinforcementSignal();
      this.callReinforcements(this);
    }
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

  private showReinforcementSignal(): void {
    this.scene.tweens.add({ targets: this, alpha: 0.3, yoyo: true, repeat: 4, duration: 90 });
    for (let index = 0; index < 3; index += 1) {
      const ring = this.scene.add.circle(this.x, this.y, 34, BOSS_COLOR, 0.12)
        .setStrokeStyle(4, 0xffffff, 0.95)
        .setDepth(this.depth + 2);
      this.scene.tweens.add({
        targets: ring,
        scale: 2.4 + index * 0.55,
        alpha: 0,
        delay: index * 110,
        duration: 520,
        ease: "Quad.easeOut",
        onComplete: () => ring.destroy(),
      });
    }
  }
}
