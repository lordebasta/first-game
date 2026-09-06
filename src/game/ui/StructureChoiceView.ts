import Phaser from "phaser";
import { GAME_WIDTH } from "../constants";
import { type StructureConstructor } from "../entities/structures";
import { createButton } from "../ui";

interface StructureChoiceViewOptions {
  choices: readonly StructureConstructor[];
  labelForSlot: (slot: number) => string;
  onChoose: (structure: StructureConstructor, slot: number) => void;
  onSkip: () => void;
}

/** Presentation-only modal for choosing, replacing, or skipping a structure. */
export class StructureChoiceView {
  private readonly modal: Phaser.GameObjects.Container;
  private waitingForSlot = false;

  constructor(private readonly scene: Phaser.Scene, private readonly options: StructureChoiceViewOptions) {
    const overlay = scene.add.rectangle(GAME_WIDTH / 2, 360, GAME_WIDTH, 720, 0x020814, 0.9);
    const title = scene.add
      .text(GAME_WIDTH / 2, 160, "POTENZIAMENTO AVAMPOSTO", {
        color: "#e8f7ff", fontFamily: "monospace", fontSize: "26px", fontStyle: "bold",
      })
      .setOrigin(0.5);
    const subtitle = scene.add
      .text(GAME_WIDTH / 2, 198, "Scegli una struttura oppure continua", {
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
    this.options.choices.forEach((structure, index) => {
      const x = 150 + index * 210;
      const button = createButton(this.scene, x, 280, structure.definition.name, () => this.showSlots(structure));
      button.setScale(0.72);
      const detail = this.scene.add
        .text(x, 330, structure.definition.description, {
          color: "#8fb2c9", fontFamily: "monospace", fontSize: "12px", align: "center", wordWrap: { width: 180 },
        })
        .setOrigin(0.5);
      this.modal.add([button, detail]);
    });
    const skip = createButton(this.scene, GAME_WIDTH / 2, 400, "CONTINUA SENZA STRUTTURA", () => this.options.onSkip());
    skip.setScale(0.72);
    this.modal.add(skip);
  }

  private showSlots(structure: StructureConstructor): void {
    if (this.waitingForSlot) {
      return;
    }
    this.waitingForSlot = true;
    for (let slot = 0; slot < 3; slot += 1) {
      const button = createButton(this.scene, 170 + slot * 190, 480, this.options.labelForSlot(slot), () => {
        this.options.onChoose(structure, slot);
      });
      button.setScale(0.68);
      this.modal.add(button);
    }
  }
}
