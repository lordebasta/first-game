import Phaser from "phaser";
import { COLORS } from "./constants";

export interface ButtonStyle {
  fill: number;
  stroke: number;
  hover: number;
  pressed: number;
}

const DEFAULT_BUTTON_STYLE: ButtonStyle = {
  fill: COLORS.panel,
  stroke: COLORS.player,
  hover: COLORS.playerGlow,
  pressed: COLORS.accent,
};

export function createButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  onClick: () => void,
  style: ButtonStyle = DEFAULT_BUTTON_STYLE,
): Phaser.GameObjects.Container {
  const background = scene.add
    .rectangle(0, 0, 260, 58, style.fill)
    .setStrokeStyle(2, style.stroke);
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
  background.on("pointerover", () => background.setFillStyle(style.hover));
  background.on("pointerout", () => background.setFillStyle(style.fill));
  background.on("pointerdown", () => background.setFillStyle(style.pressed));
  background.on("pointerup", () => {
    background.setFillStyle(style.hover);
    onClick();
  });

  return button;
}
