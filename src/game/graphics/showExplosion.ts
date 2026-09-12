import type Phaser from "phaser";

export function showExplosion(scene: Phaser.Scene, x: number, y: number, radius: number): void {
  const flash = scene.add.circle(x, y, radius, 0xffc857, 0.25);
  const core = scene.add.circle(x, y, Math.max(4, radius * 0.24), 0xffffff, 0.95);
  const fragments = Array.from({ length: Math.max(5, Math.min(12, Math.round(radius / 8))) }, (_, index) => {
    const angle = index / Math.max(1, Math.round(radius / 8)) * Math.PI * 2 + Math.random() * 0.35;
    return scene.add.rectangle(x, y, 3 + Math.random() * 5, 2 + Math.random() * 3, index % 2 ? 0xff5470 : 0xffdc57)
      .setRotation(angle);
  });
  scene.tweens.add({ targets: flash, alpha: 0, scale: 1.25, duration: 240, onComplete: () => flash.destroy() });
  scene.tweens.add({ targets: core, alpha: 0, scale: 2.4, duration: 150, onComplete: () => core.destroy() });
  fragments.forEach((fragment, index) => {
    const angle = index / fragments.length * Math.PI * 2 + Math.random() * 0.4;
    const distance = radius * (0.55 + Math.random() * 0.55);
    scene.tweens.add({
      targets: fragment,
      x: x + Math.cos(angle) * distance,
      y: y + Math.sin(angle) * distance,
      angle: fragment.angle + 140 + Math.random() * 180,
      alpha: 0,
      duration: 260 + Math.random() * 180,
      ease: "Quad.easeOut",
      onComplete: () => fragment.destroy(),
    });
  });
}
