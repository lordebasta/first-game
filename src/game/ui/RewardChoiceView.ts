import Phaser from "phaser";
import { COLORS, GAME_WIDTH } from "../constants";
import { createButton } from "../ui";

export interface RewardChoice {
  name: string;
  description: string;
  choose: () => void;
}

interface RewardChoiceViewOptions {
  title: string;
  subtitle: string;
  choices: readonly RewardChoice[];
}

/** Presentation-only modal for the Golden Raider's multi-step reward. */
export class RewardChoiceView {
  private readonly modal: Phaser.GameObjects.Container;
  private chosen = false;

  constructor(scene: Phaser.Scene, options: RewardChoiceViewOptions) {
    const overlay = scene.add.rectangle(GAME_WIDTH / 2, 360, GAME_WIDTH, 720, 0x020814, 0.94);
    const title = scene.add.text(GAME_WIDTH / 2, 108, options.title, {
      color: "#ffd84d", fontFamily: "monospace", fontSize: "26px", fontStyle: "bold",
    }).setOrigin(0.5);
    const subtitle = scene.add.text(GAME_WIDTH / 2, 150, options.subtitle, {
      color: COLORS.mutedText, fontFamily: "monospace", fontSize: "15px", align: "center",
      wordWrap: { width: 620 },
    }).setOrigin(0.5);
    this.modal = scene.add.container(0, 0, [overlay, title, subtitle]).setDepth(100);

    options.choices.forEach((choice, index) => {
      const columns = Math.min(3, options.choices.length);
      const row = Math.floor(index / columns);
      const column = index % columns;
      const entriesInRow = Math.min(columns, options.choices.length - row * columns);
      const x = GAME_WIDTH / 2 + (column - (entriesInRow - 1) / 2) * 215;
      const y = 260 + row * 175;
      const button = createButton(scene, x, y, choice.name, () => {
        if (this.chosen) return;
        this.chosen = true;
        choice.choose();
      });
      button.setScale(0.72);
      const detail = scene.add.text(x, y + 54, choice.description, {
        color: COLORS.mutedText, fontFamily: "monospace", fontSize: "12px", align: "center",
        wordWrap: { width: 185 },
      }).setOrigin(0.5);
      this.modal.add([button, detail]);
    });
  }

  destroy(): void {
    this.modal.destroy(true);
  }
}
