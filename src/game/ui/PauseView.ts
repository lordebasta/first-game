import Phaser from "phaser";
import { COLORS, GAME_HEIGHT, GAME_WIDTH } from "../constants";
import { createButton, createSlider } from "../ui";

interface PauseViewOptions {
  onResume: () => void;
  onMenu: () => void;
}

/** Player pause modal. Gameplay remains owned by GameScene. */
export class PauseView {
  private readonly modal: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, options: PauseViewOptions) {
    const overlay = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x020814, 0.9);
    const title = scene.add
      .text(GAME_WIDTH / 2, 180, "PAUSA", {
        color: COLORS.text,
        fontFamily: "monospace",
        fontSize: "42px",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    const volume = createSlider(
      scene,
      GAME_WIDTH / 2,
      290,
      "VOLUME",
      scene.sound.volume,
      (value) => scene.sound.setVolume(value),
    );
    const resume = createButton(scene, GAME_WIDTH / 2, 400, "RIPRENDI", options.onResume);
    const menu = createButton(scene, GAME_WIDTH / 2, 485, "MENU", options.onMenu);
    const hint = scene.add
      .text(GAME_WIDTH / 2, 565, "Esc: riprendi", {
        color: COLORS.mutedText,
        fontFamily: "monospace",
        fontSize: "16px",
      })
      .setOrigin(0.5);
    this.modal = scene.add.container(0, 0, [overlay, title, volume, resume, menu, hint]).setDepth(100);
  }

  destroy(): void {
    this.modal.destroy(true);
  }
}
