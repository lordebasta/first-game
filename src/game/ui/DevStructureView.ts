import Phaser from "phaser";
import { COLORS, GAME_WIDTH } from "../constants";
import { DEV_STRUCTURE_CATALOG } from "../entities/structures";
import type { StructureSlots } from "../systems/StructureSlots";
import { createButton, type ButtonStyle } from "../ui";

interface DevStructureViewOptions {
  slots: StructureSlots;
  onClose: () => void;
}

const ACTIVE_STYLE: ButtonStyle = {
  fill: 0x245844,
  stroke: COLORS.accent,
  hover: 0x367b5e,
  pressed: 0x17382e,
};

/** Development sandbox for placing every structure and toggling its upgrades. */
export class DevStructureView {
  private readonly modal: Phaser.GameObjects.Container;
  private detailObjects: Phaser.GameObjects.GameObject[] = [];
  private selectedIndex = 0;

  constructor(private readonly scene: Phaser.Scene, private readonly options: DevStructureViewOptions) {
    const overlay = scene.add.rectangle(GAME_WIDTH / 2, 360, GAME_WIDTH, 720, 0x020814, 0.96);
    const title = scene.add.text(GAME_WIDTH / 2, 42, "LABORATORIO STRUTTURE", {
      color: COLORS.text, fontFamily: "monospace", fontSize: "25px", fontStyle: "bold",
    }).setOrigin(0.5);
    const leftTitle = scene.add.text(150, 86, "STRUTTURE", {
      color: "#56f29a", fontFamily: "monospace", fontSize: "14px", fontStyle: "bold",
    }).setOrigin(0.5);
    this.modal = scene.add.container(0, 0, [overlay, title, leftTitle]).setDepth(100);

    DEV_STRUCTURE_CATALOG.forEach((entry, index) => {
      const button = createButton(scene, 150, 126 + index * 57, entry.StructureClass.definition.name, () => {
        this.selectedIndex = index;
        this.showSelected();
      });
      button.setScale(0.78);
      this.modal.add(button);
    });
    const close = createButton(scene, GAME_WIDTH / 2, 678, "CHIUDI", options.onClose);
    close.setScale(0.68);
    this.modal.add(close);
    this.showSelected();
  }

  destroy(): void {
    this.modal.destroy(true);
  }

  private showSelected(): void {
    this.detailObjects.forEach((object) => object.destroy());
    this.detailObjects = [];
    const entry = DEV_STRUCTURE_CATALOG[this.selectedIndex];
    const kind = entry.StructureClass.definition.kind;
    const heading = this.scene.add.text(500, 86, entry.StructureClass.definition.name, {
      color: "#fff29a", fontFamily: "monospace", fontSize: "17px", fontStyle: "bold",
    }).setOrigin(0.5);
    const description = this.scene.add.text(500, 118, entry.StructureClass.definition.description, {
      color: COLORS.mutedText, fontFamily: "monospace", fontSize: "12px", align: "center", wordWrap: { width: 310 },
    }).setOrigin(0.5);
    const slotTitle = this.scene.add.text(500, 177, "PIAZZA IN UNO SLOT LIBERO", {
      color: "#56f29a", fontFamily: "monospace", fontSize: "12px", fontStyle: "bold",
    }).setOrigin(0.5);
    this.addDetails(heading, description, slotTitle);

    const freeSlots = this.options.slots.getStructures().flatMap((structure, slot) => structure ? [] : [slot]);
    freeSlots.forEach((slot, index) => {
      const x = 500 + (index - (freeSlots.length - 1) / 2) * 104;
      const button = createButton(this.scene, x, 215, `SLOT ${slot + 1}`, () => {
        this.options.slots.place(slot, entry.StructureClass);
        this.showSelected();
      });
      button.setScale(0.38);
      this.addDetails(button);
    });
    if (freeSlots.length === 0) {
      this.addDetails(this.scene.add.text(500, 215, "NESSUNO SLOT LIBERO", {
        color: COLORS.mutedText, fontFamily: "monospace", fontSize: "12px",
      }).setOrigin(0.5));
    }

    const upgradeTitle = this.scene.add.text(500, 278, "UPGRADE (TOGGLE)", {
      color: "#fff29a", fontFamily: "monospace", fontSize: "13px", fontStyle: "bold",
    }).setOrigin(0.5);
    this.addDetails(upgradeTitle);
    entry.upgrades.forEach((upgrade, index) => {
      const enabled = this.options.slots.hasUpgrade(kind, upgrade.id);
      const button = createButton(this.scene, 500, 326 + index * 88, `${enabled ? "[X]" : "[ ]"} ${upgrade.name}`, () => {
        if (enabled) this.options.slots.removeUpgrade(kind, upgrade.id);
        else this.options.slots.applyUpgrade(kind, upgrade.id);
        this.showSelected();
      }, enabled ? ACTIVE_STYLE : undefined);
      button.setScale(0.82, 0.68);
      const detail = this.scene.add.text(500, 359 + index * 88, upgrade.description, {
        color: COLORS.mutedText, fontFamily: "monospace", fontSize: "11px", align: "center", wordWrap: { width: 300 },
      }).setOrigin(0.5);
      this.addDetails(button, detail);
    });
  }

  private addDetails(...objects: Phaser.GameObjects.GameObject[]): void {
    this.detailObjects.push(...objects);
    this.modal.add(objects);
  }
}
