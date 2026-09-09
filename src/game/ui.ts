import Phaser from "phaser";
import { COLORS } from "./constants";
import { playUiClickSound } from "./audio/SoundEffects";

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
  background.on("pointerdown", () => {
    background.setFillStyle(style.pressed);
    playUiClickSound(scene);
  });
  background.on("pointerup", () => {
    background.setFillStyle(style.hover);
    onClick();
  });

  return button;
}

export function createSlider(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  initialValue: number,
  onChange: (value: number) => void,
  width = 260,
  onInteract?: () => void,
): Phaser.GameObjects.Container {
  const value = Phaser.Math.Clamp(initialValue, 0, 1);
  const labelText = scene.add
    .text(0, -31, label, { color: COLORS.text, fontFamily: "monospace", fontSize: "16px" })
    .setOrigin(0.5);
  const track = scene.add.rectangle(0, 0, width, 12, COLORS.playerGlow).setStrokeStyle(2, COLORS.player);
  const knob = scene.add.circle((value - 0.5) * width, 0, 12, COLORS.projectile).setStrokeStyle(2, 0xe8f7ff);
  const valueText = scene.add
    .text(0, 28, `${Math.round(value * 100)}%`, {
      color: COLORS.mutedText,
      fontFamily: "monospace",
      fontSize: "14px",
    })
    .setOrigin(0.5);
  const slider = scene.add.container(x, y, [labelText, track, knob, valueText]);

  const updateValue = (localX: number): void => {
    const nextValue = Phaser.Math.Clamp(localX / width, 0, 1);
    knob.x = (nextValue - 0.5) * width;
    valueText.setText(`${Math.round(nextValue * 100)}%`);
    onChange(nextValue);
  };
  track.setInteractive(new Phaser.Geom.Rectangle(0, -12, width, 36), Phaser.Geom.Rectangle.Contains, true);
  track.on("pointerdown", (_pointer: Phaser.Input.Pointer, localX: number) => {
    updateValue(localX);
    onInteract?.();
  });
  track.on("pointermove", (pointer: Phaser.Input.Pointer, localX: number) => {
    if (pointer.isDown) updateValue(localX);
  });

  return slider;
}
