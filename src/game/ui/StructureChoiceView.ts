import Phaser from "phaser";
import { COLORS, GAME_WIDTH } from "../constants";
import { type OutpostCard, type StructureCard } from "../systems/OutpostCardSystem";
import { createButton, type ButtonStyle } from "../ui";

interface StructureChoiceViewOptions {
  choices: readonly OutpostCard[];
  onChoose: (apply: () => void) => void;
}

const STRUCTURE_CARD_STYLE: ButtonStyle = {
  fill: 0x17382e,
  stroke: COLORS.accent,
  hover: 0x245844,
  pressed: 0x367b5e,
};
const UPGRADE_CARD_STYLE: ButtonStyle = {
  fill: 0x26334d,
  stroke: COLORS.projectile,
  hover: 0x3a4d70,
  pressed: 0x576d96,
};

/** Presentation-only modal for structure and upgrade cards. */
export class StructureChoiceView {
  private readonly modal: Phaser.GameObjects.Container;
  private targetButtons: Phaser.GameObjects.Container[] = [];
  private chosen = false;

  constructor(private readonly scene: Phaser.Scene, private readonly options: StructureChoiceViewOptions) {
    const overlay = scene.add.rectangle(GAME_WIDTH / 2, 360, GAME_WIDTH, 720, 0x020814, 0.9);
    const title = scene.add
      .text(GAME_WIDTH / 2, 160, "POTENZIAMENTO AVAMPOSTO", {
        color: "#e8f7ff", fontFamily: "monospace", fontSize: "26px", fontStyle: "bold",
      })
      .setOrigin(0.5);
    const subtitle = scene.add
      .text(GAME_WIDTH / 2, 198, "Scegli una carta per l'avamposto", {
        color: "#8fb2c9", fontFamily: "monospace", fontSize: "16px",
      })
      .setOrigin(0.5);
    this.modal = scene.add.container(0, 0, [overlay, title, subtitle]);
    this.showChoices();
  }

  destroy(): void {
    this.modal.destroy(true);
  }

  private showChoices(): void {
    this.options.choices.forEach((card, index) => {
      const x = GAME_WIDTH / 2 + (index - (this.options.choices.length - 1) / 2) * 210;
      const style = card.kind === "structure" ? STRUCTURE_CARD_STYLE : UPGRADE_CARD_STYLE;
      const category = this.scene.add
        .text(x, 242, card.kind === "structure" ? "STRUTTURA" : "POTENZIAMENTO", {
          color: card.kind === "structure" ? "#56f29a" : "#fff29a",
          fontFamily: "monospace",
          fontSize: "11px",
          fontStyle: "bold",
        })
        .setOrigin(0.5);
      const button = createButton(this.scene, x, 280, card.name, () => this.chooseCard(card), style);
      button.setScale(0.72);
      const detail = this.scene.add
        .text(x, 330, card.description, {
          color: "#8fb2c9", fontFamily: "monospace", fontSize: "12px", align: "center", wordWrap: { width: 180 },
        })
        .setOrigin(0.5);
      this.modal.add([category, button, detail]);
    });
  }

  private chooseCard(card: OutpostCard): void {
    if (this.chosen) return;
    if (card.kind === "upgrade") {
      this.chosen = true;
      this.options.onChoose(card.apply);
      return;
    }
    this.showSlots(card);
  }

  private showSlots(card: StructureCard): void {
    if (this.chosen) return;
    this.targetButtons.forEach((button) => button.destroy());
    this.targetButtons = [];
    for (const [index, target] of card.targets.entries()) {
      const x = GAME_WIDTH / 2 + (index - (card.targets.length - 1) / 2) * 190;
      const button = createButton(this.scene, x, 480, target.label, () => {
        if (this.chosen) return;
        this.chosen = true;
        this.options.onChoose(target.apply);
      });
      button.setScale(0.68);
      this.modal.add(button);
      this.targetButtons.push(button);
    }
  }
}
