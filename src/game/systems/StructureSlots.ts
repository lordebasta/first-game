import Phaser from "phaser";
import { GAME_WIDTH } from "../constants";
import { createStructure, type StructureConstructor } from "../entities/structures";
import { type OutpostStructure, type StructureKind } from "../entities/structures/OutpostStructure";


const SLOT_Y = 625;
const SLOT_X = [170, GAME_WIDTH / 2, 550] as const;
const SLOT_WIDTH = 178;

/** Owns slot occupancy and the run-wide upgrades acquired for each structure type. */
export class StructureSlots {
  private readonly structures: Array<OutpostStructure | undefined> = [undefined, undefined, undefined];
  private readonly structureUpgrades = new Map<StructureKind, Set<string>>();

  constructor(private readonly scene: Phaser.Scene) {
    this.drawSlots();
  }

  update(time: number): void {
    this.structures.forEach((structure) => structure?.update(time));
  }

  place(slot: number, StructureClass: StructureConstructor): void {
    if (this.structures[slot]) return;
    const structure = createStructure(StructureClass, this.scene, SLOT_X[slot], SLOT_Y);
    this.structures[slot] = structure;
    structure.install();
    for (const upgradeId of this.structureUpgrades.get(structure.definition.kind) ?? []) {
      structure.applyUpgrade(upgradeId);
    }
  }

  labelFor(slot: number): string {
    return this.structures[slot] ? `OCCUPATO ${slot + 1}` : `SLOT ${slot + 1}`;
  }

  repairAll(): void {
    this.structures.forEach((structure) => structure?.repair());
  }

  getStructures(): readonly (OutpostStructure | undefined)[] {
    return [...this.structures];
  }

  hasUpgrade(kind: StructureKind, upgradeId: string): boolean {
    return this.structureUpgrades.get(kind)?.has(upgradeId) ?? false;
  }

  applyUpgrade(kind: StructureKind, upgradeId: string): void {
    if (this.hasUpgrade(kind, upgradeId)) return;
    const upgrades = this.structureUpgrades.get(kind) ?? new Set<string>();
    upgrades.add(upgradeId);
    this.structureUpgrades.set(kind, upgrades);
    this.structures.forEach((structure) => {
      if (structure?.definition.kind === kind) structure.applyUpgrade(upgradeId);
    });
  }

  removeUpgrade(kind: StructureKind, upgradeId: string): void {
    const upgrades = this.structureUpgrades.get(kind);
    if (!upgrades?.delete(upgradeId)) return;
    this.structures.forEach((structure) => {
      if (structure?.definition.kind === kind) structure.removeUpgrade(upgradeId);
    });
  }

  private drawSlots(): void {
    SLOT_X.forEach((x, index) => {
      this.scene.add.rectangle(x, SLOT_Y, SLOT_WIDTH, 52, 0x0b1a2d, 0.55).setStrokeStyle(2, 0x57728d).setDepth(-1);
      this.scene.add
        .text(x, SLOT_Y + 4, `SLOT ${index + 1}`, { color: "#57728d", fontFamily: "monospace", fontSize: "14px" })
        .setOrigin(0.5)
        .setDepth(-1);
    });
  }
}
