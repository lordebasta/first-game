import Phaser from "phaser";

/** Projectile reserved for the future Bombardier enemy. */
export class Bomb extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x = 0, y = 0) {
    super(scene, x, y, "enemy");
    this.setTint(0xffc857);
  }

  hasReached(y: number): boolean {
    return this.active && this.y + this.displayHeight / 2 >= y;
  }

  deactivate(): void {
    this.disableBody(true, true);
  }
}
