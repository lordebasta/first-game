import Phaser from "phaser";
import type { Hittable } from "../combat/Hittable";
import type { Hit } from "../combat/Hit";

export class Enemy extends Phaser.Physics.Arcade.Sprite implements Hittable {
  constructor(scene: Phaser.Scene, x = 0, y = 0) {
    super(scene, x, y, "enemy");
  }

  spawn(x: number, y: number): void {
    this.enableBody(true, x, y, true, true);
    this.setVelocity(0, 0);
  }

  moveBy(x: number, y: number): void {
    this.setPosition(this.x + x, this.y + y);
    this.body?.reset(this.x, this.y);
  }

  hasReached(y: number): boolean {
    return this.active && this.y + this.displayHeight / 2 >= y;
  }

  receiveHit(_hit: Hit): void {
    this.deactivate();
  }

  deactivate(): void {
    this.disableBody(true, true);
  }
}
