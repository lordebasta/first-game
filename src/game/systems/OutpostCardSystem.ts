import Phaser from "phaser";
import { STRUCTURE_CLASSES } from "../entities/structures";
import { Turret, TURRET_UPGRADES } from "../entities/structures/Turret";
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
    const structureCards: OutpostCard[] = [];
    const upgradeCards: OutpostCard[] = [];
    const freeSlots = structures.filter((structure) => !structure).length;
    if (freeSlots > 0) {
      for (const StructureClass of STRUCTURE_CLASSES) {
        structureCards.push({
          kind: "structure",
          name: StructureClass.definition.name,
          description: StructureClass.definition.description,
          targets: structures.flatMap((structure, slot) =>
            structure?.definition.kind === StructureClass.definition.kind ? [] : [{
              label: this.slots.labelFor(slot),
              apply: () => this.slots.place(slot, StructureClass),
            }]),
        });
      }
    }
    for (const upgrade of TURRET_UPGRADES) {
      const targets = structures.flatMap((structure, slot) =>
        structure instanceof Turret && !structure.hasUpgrade(upgrade.id) ? [{
          label: `TORRETTA ${slot + 1}`,
          apply: () => structure.applyUpgrade(upgrade.id),
        }] : []);
      if (targets.length > 0) {
        upgradeCards.push({ kind: "upgrade", name: upgrade.name, description: `Torretta: ${upgrade.description}`, targets });
      }
    }
    return [
      ...Phaser.Utils.Array.Shuffle(structureCards).slice(0, freeSlots),
      ...Phaser.Utils.Array.Shuffle(upgradeCards).slice(0, 3 - freeSlots),
    ];
  }
}
