import Phaser from "phaser";
import type { Hittable } from "../combat/Hittable";
import type { Hit } from "../combat/Hit";

export type EnemyHealth = number;
export interface EnemySpawnOptions {
  health?: EnemyHealth;
}

export interface EnemyDefinition {
  readonly texture: string;
  readonly health: EnemyHealth;
}
const HEALTH_COLORS = [0xff5470, 0xb86aff, 0x428dff, 0xffdc57] as const;

/** Shared combat and lifecycle contract for every enemy type. */
export abstract class Enemy extends Phaser.Physics.Arcade.Sprite implements Hittable {
  private currentHealth = 1;
  private marked = false;
  private markedDamageBonus = 1;
  private marker?: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number, private readonly definition: EnemyDefinition) {
    super(scene, x, y, definition.texture);
  }

  spawn(x: number, y: number, options: EnemySpawnOptions = {}): void {
    this.enableBody(true, x, y, true, true);
    this.setVelocity(0, 0);
    this.setScale(1);
    this.setAlpha(1);
    this.health = options.health ?? this.definition.health;
    this.setMarked(false);
    this.onSpawn(x, y);
  }

  protected onSpawn(_x: number, _y: number): void {}

  usesFormationMovement(): boolean {
    return true;
  }

  updateMovement(_time: number, _delta: number): void {}

  updateMarker(delta: number): void {
    if (!this.marked || !this.marker) {
      return;
    }
    this.marker.setPosition(this.x, this.y);
    this.marker.rotation += delta * 0.003;
  }

  moveBy(x: number, y: number): void {
    this.setPosition(this.x + x, this.y + y);
    this.body?.reset(this.x, this.y);
  }

  hasReached(y: number): boolean {
    return this.active && this.y + this.displayHeight / 2 >= y;
  }

  receiveHit(hit: Hit): void {
    this.health -= hit.damage + (this.marked ? this.markedDamageBonus : 0);
    if (this.health <= 0) {
      this.deactivate();
    }
  }

  getHealth(): number {
    return this.health;
  }

  setMarked(value: boolean, damageBonus = 1): void {
    this.marked = value;
    this.markedDamageBonus = damageBonus;
    if (value) {
      this.showMarker();
    } else {
      this.marker?.setVisible(false);
    }
  }

  private get health(): number {
    return this.currentHealth;
  }

  private set health(value: number) {
    this.currentHealth = value;
    this.updateHealthColor();
  }

  private updateHealthColor(): void {
    const index = Math.max(0, Math.min(3, Math.ceil(this.health) - 1));
    this.setTint(HEALTH_COLORS[index]);
  }

  deactivate(): void {
    this.setMarked(false);
    this.disableBody(true, true);
  }

  private showMarker(): void {
    if (!this.marker) {
      const marker = this.scene.add.graphics();
      marker.lineStyle(2, 0x9fe7ff, 0.95);
      marker.strokeCircle(0, 0, 25);
      marker.lineBetween(-31, 0, -20, 0);
      marker.lineBetween(20, 0, 31, 0);
      marker.lineBetween(0, -31, 0, -20);
      marker.lineBetween(0, 20, 0, 31);
      this.marker = marker.setDepth(this.depth + 1);
    }
    this.marker.setPosition(this.x, this.y).setVisible(true);
  }
}
