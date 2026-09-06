import Phaser from "phaser";
import { COLORS } from "./constants";

export function createButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  onClick: () => void,
): Phaser.GameObjects.Container {
  const background = scene.add
    .rectangle(0, 0, 260, 58, COLORS.panel)
    .setStrokeStyle(2, COLORS.player);
  const text = scene.add
    .text(0, 0, label, {
      color: COLORS.text,
      fontFamily: "monospace",
      fontSize: "22px",
      fontStyle: "bold",
    })
    .setOrigin(0.5);

  const button = scene.add.container(x, y, [background, text]);
  background.setInteractive({ useHandCursor: true });
  background.on("pointerover", () => background.setFillStyle(COLORS.playerGlow));
  background.on("pointerout", () => background.setFillStyle(COLORS.panel));
  background.on("pointerdown", () => background.setFillStyle(COLORS.accent));
  background.on("pointerup", () => {
    background.setFillStyle(COLORS.playerGlow);
    onClick();
  });

  return button;
}
