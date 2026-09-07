import type Phaser from "phaser";

export function showExplosion(scene: Phaser.Scene, x: number, y: number, radius: number): void {
  const flash = scene.add.circle(x, y, radius, 0xffc857, 0.25);
  scene.tweens.add({ targets: flash, alpha: 0, duration: 180, onComplete: () => flash.destroy() });
}
