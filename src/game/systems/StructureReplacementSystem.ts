import Phaser from "phaser";
import { STRUCTURE_CLASSES } from "../entities/structures";
import type {
  StructureConstructor,
  StructureKind,
  StructureUpgrade,
} from "../entities/structures/OutpostStructure";
import type { StructureSlots } from "./StructureSlots";
import { RewardChoiceView, type RewardChoice } from "../ui/RewardChoiceView";

export interface ReplacementSlotChoice {
  slot: number;
  name: string;
  description: string;
}

export interface ReplacementStructureChoice {
  StructureClass: StructureConstructor;
  name: string;
  description: string;
}

export interface ReplacementResult {
  kind: StructureKind;
  upgradeChoices: number;
}

/** Owns the rules for the Golden Raider's structure replacement reward. */
export class StructureReplacementSystem {
  private rewardChoice?: RewardChoiceView;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly slots: StructureSlots,
    private readonly setGameplayPaused: (paused: boolean) => void,
  ) {}

  open(): boolean {
    if (this.rewardChoice) return false;
    const slots = this.getSlotChoices();
    if (slots.length === 0) return false;
    this.setGameplayPaused(true);
    this.showChoice(
      "PREDA DORATA DISTRUTTA",
      "Scegli la struttura da sostituire",
      slots.map((choice) => ({
        name: choice.name,
        description: choice.description,
        choose: () => this.chooseReplacement(choice.slot),
      })),
    );
    return true;
  }

  isOpen(): boolean {
    return this.rewardChoice !== undefined;
  }

  destroy(): void {
    this.rewardChoice?.destroy();
    this.rewardChoice = undefined;
  }

  getSlotChoices(): ReplacementSlotChoice[] {
    return this.slots.getStructures().flatMap((structure, slot) => structure ? [{
      slot,
      name: `SLOT ${slot + 1} · ${structure.definition.name}`,
      description: `${this.slots.getUpgradeCount(structure.definition.kind)} upgrade acquisiti`,
    }] : []);
  }

  getStructureChoices(slot: number): ReplacementStructureChoice[] {
    const structures = this.slots.getStructures();
    const replaced = structures[slot];
    if (!replaced) return [];
    return STRUCTURE_CLASSES.flatMap((StructureClass) => {
      if (StructureClass.definition.availableInCards === false
        || StructureClass.definition.kind === replaced.definition.kind
        || StructureClass.definition.unique && structures.some(
          (structure, index) => index !== slot && structure?.definition.kind === StructureClass.definition.kind,
        )) return [];
      return [{
        StructureClass,
        name: StructureClass.definition.name,
        description: StructureClass.definition.description,
      }];
    });
  }

  replace(slot: number, StructureClass: StructureConstructor): ReplacementResult | undefined {
    const replaced = this.slots.getStructures()[slot];
    if (!replaced || !this.getStructureChoices(slot).some((choice) => choice.StructureClass === StructureClass)) {
      return undefined;
    }
    const upgradeChoices = this.slots.getUpgradeCount(replaced.definition.kind);
    if (!this.slots.replace(slot, StructureClass)) return undefined;
    return { kind: StructureClass.definition.kind, upgradeChoices };
  }

  getUpgradeChoices(kind: StructureKind): readonly StructureUpgrade[] {
    const structure = this.slots.getStructures().find((candidate) => candidate?.definition.kind === kind);
    return structure?.getUpgradeDefinitions().filter((upgrade) => !this.slots.hasUpgrade(kind, upgrade.id)) ?? [];
  }

  applyUpgrade(kind: StructureKind, upgradeId: string): void {
    this.slots.applyUpgrade(kind, upgradeId);
  }

  private chooseReplacement(slot: number): void {
    const choices = this.getStructureChoices(slot);
    if (choices.length === 0) {
      this.close();
      return;
    }
    this.showChoice(
      "NUOVA STRUTTURA",
      "Scegli cosa installare nello slot selezionato",
      choices.map((choice) => ({
        name: choice.name,
        description: choice.description,
        choose: () => {
          const result = this.replace(slot, choice.StructureClass);
          if (!result) {
            this.close();
            return;
          }
          this.chooseUpgrade(result.kind, result.upgradeChoices);
        },
      })),
    );
  }

  private chooseUpgrade(kind: StructureKind, remaining: number): void {
    if (remaining <= 0) {
      this.close();
      return;
    }
    const upgrades = this.getUpgradeChoices(kind);
    if (upgrades.length === 0) {
      this.close();
      return;
    }
    this.showChoice(
      "TRASFERIMENTO UPGRADE",
      `Scegli un upgrade per la nuova struttura · ${remaining} rimanenti`,
      upgrades.map((upgrade) => ({
        name: upgrade.name,
        description: upgrade.description,
        choose: () => {
          this.applyUpgrade(kind, upgrade.id);
          this.chooseUpgrade(kind, remaining - 1);
        },
      })),
    );
  }

  private showChoice(title: string, subtitle: string, choices: RewardChoice[]): void {
    this.rewardChoice?.destroy();
    this.rewardChoice = new RewardChoiceView(this.scene, { title, subtitle, choices });
  }

  private close(): void {
    this.destroy();
    this.setGameplayPaused(false);
  }
}
