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
    const upgradeKinds = new Map<string, NonNullable<typeof structures[number]>>();
    for (const structure of structures) {
      if (structure && typeof structure.getUpgradeDefinitions === "function") {
        upgradeKinds.set(structure.definition.kind, structure);
      }
    }
    for (const sample of upgradeKinds.values()) {
      for (const upgrade of sample.getUpgradeDefinitions()) {
        const targets = structures.flatMap((structure, slot) =>
          structure?.definition.kind === sample.definition.kind && !structure.hasUpgrade(upgrade.id) ? [{
            label: `${structure.definition.name} ${slot + 1}`,
            apply: () => structure.applyUpgrade(upgrade.id),
          }] : []);
        if (targets.length > 0) {
          const structureName = sample.definition.name.charAt(0) + sample.definition.name.slice(1).toLowerCase();
          upgradeCards.push({
            kind: "upgrade",
            name: upgrade.name,
            description: `${structureName}: ${upgrade.description}`,
            targets,
          });
        }
      }
    }
    return [
      ...Phaser.Utils.Array.Shuffle(structureCards).slice(0, freeSlots),
      ...Phaser.Utils.Array.Shuffle(upgradeCards).slice(0, 3 - freeSlots),
    ];
  }
}
