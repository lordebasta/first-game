import Phaser from "phaser";
import { COLORS, GAME_WIDTH } from "../constants";
import { createButton } from "../ui";

interface DevWaveViewOptions {
  lastWave: number;
  onChoose: (wave: number) => void;
  onClose: () => void;
}

/** Development-only modal for jumping directly to an authored wave. */
export class DevWaveView {
  private readonly modal: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, options: DevWaveViewOptions) {
    const overlay = scene.add.rectangle(GAME_WIDTH / 2, 360, GAME_WIDTH, 720, 0x020814, 0.96);
    const title = scene.add.text(GAME_WIDTH / 2, 145, "SALTA ALL'ONDATA", {
      color: COLORS.text, fontFamily: "monospace", fontSize: "26px", fontStyle: "bold",
    }).setOrigin(0.5);
    this.modal = scene.add.container(0, 0, [overlay, title]);

    for (let wave = 1; wave <= options.lastWave; wave += 1) {
      const column = (wave - 1) % 5;
      const row = Math.floor((wave - 1) / 5);
      const button = createButton(scene, 144 + column * 108, 255 + row * 92, wave.toString().padStart(2, "0"), () => {
        options.onChoose(wave);
      });
      button.setScale(0.36, 0.72);
      this.modal.add(button);
    }

    const close = createButton(scene, GAME_WIDTH / 2, 500, "ANNULLA", options.onClose);
    close.setScale(0.68);
    this.modal.add(close);
  }

  destroy(): void {
    this.modal.destroy(true);
  }
}
