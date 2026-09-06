import Phaser from "phaser";
import type { Hittable } from "../combat/Hittable";
import type { Hit } from "../combat/Hit";

export class Enemy extends Phaser.Physics.Arcade.Sprite implements Hittable {
  private health = 1;
  private marked = false;

  constructor(scene: Phaser.Scene, x = 0, y = 0) {
    super(scene, x, y, "enemy");
  }

  spawn(x: number, y: number): void {
    this.enableBody(true, x, y, true, true);
    this.setVelocity(0, 0);
    this.health = 1;
    this.setMarked(false);
  }

  moveBy(x: number, y: number): void {
    this.setPosition(this.x + x, this.y + y);
    this.body?.reset(this.x, this.y);
  }

  hasReached(y: number): boolean {
    return this.active && this.y + this.displayHeight / 2 >= y;
  }

  receiveHit(hit: Hit): void {
    this.health -= hit.damage * (this.marked ? 2 : 1);
    if (this.health <= 0) {
      this.deactivate();
    }
  }

  getHealth(): number {
    return this.health;
  }

  setMarked(value: boolean): void {
    this.marked = value;
    if (value) {
      this.setTint(0xfff29a);
    } else {
      this.clearTint();
    }
  }

  deactivate(): void {
    this.setMarked(false);
    this.disableBody(true, true);
  }
}
