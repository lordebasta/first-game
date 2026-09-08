import Phaser from "phaser";
import { STRUCTURE_CLASSES } from "../entities/structures";
import type { StructureSlots } from "./StructureSlots";

export interface OutpostCard {
  kind: "structure" | "upgrade";
  name: string;
  description: string;
  targets: { label: string; apply: () => void }[];
}

/** Builds eligible cards and applies the free-slot quota when drawing a hand. */
export class OutpostCardSystem {
  constructor(private readonly slots: StructureSlots) {}

  draw(): OutpostCard[] {
    const structures = this.slots.getStructures();
    const upgradeCards: OutpostCard[] = [];
    const freeSlots = structures.filter((structure) => !structure).length;
    const structureCards = freeSlots > 0 ? this.buildStructureCards() : [];
    const upgradeKinds = new Map<string, NonNullable<typeof structures[number]>>();
    for (const structure of structures) {
      if (structure && structure.definition.availableInCards !== false) {
        upgradeKinds.set(structure.definition.kind, structure);
      }
    }
    for (const sample of upgradeKinds.values()) {
      for (const upgrade of sample.getUpgradeDefinitions()) {
        if (!this.slots.hasUpgrade(sample.definition.kind, upgrade.id)) {
          const structureName = sample.definition.name.charAt(0) + sample.definition.name.slice(1).toLowerCase();
          upgradeCards.push({
            kind: "upgrade",
            name: upgrade.name,
            description: `${structureName}: ${upgrade.description}`,
            targets: [{
              label: `TUTTE: ${sample.definition.name}`,
              apply: () => this.slots.applyUpgrade(sample.definition.kind, upgrade.id),
            }],
          });
        }
      }
    }
    return [
      ...Phaser.Utils.Array.Shuffle(structureCards).slice(0, freeSlots),
      ...Phaser.Utils.Array.Shuffle(upgradeCards).slice(0, 3 - freeSlots),
    ];
  }

  drawStructures(): OutpostCard[] {
    return Phaser.Utils.Array.Shuffle(this.buildStructureCards()).slice(0, 3);
  }

  private buildStructureCards(): OutpostCard[] {
    const structures = this.slots.getStructures();
    return STRUCTURE_CLASSES.flatMap((StructureClass) => {
      if (StructureClass.definition.availableInCards === false) return [];
      const targets = structures.flatMap((structure, slot) =>
        structure?.definition.kind === StructureClass.definition.kind ? [] : [{
          label: this.slots.labelFor(slot),
          apply: () => this.slots.place(slot, StructureClass),
        }]);
      if (targets.length === 0) return [];
      return [{
        kind: "structure" as const,
        name: StructureClass.definition.name,
        description: StructureClass.definition.description,
        targets,
      }];
    });
  }
}
