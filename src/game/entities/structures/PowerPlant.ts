import { COLORS } from "../../constants";
import { Player } from "../Player";
import { PlayerWeapon } from "../../systems/PlayerWeapon";
import { RUN_DATA } from "../../RunData";
import { OutpostStructure, type StructureUpgrade } from "./OutpostStructure";
import type { StructureSlots } from "../../systems/StructureSlots";

export const POWER_PLANT_UPGRADES = [
  { id: "overcharged", name: "REATTORE SOVRALIMENTATO", description: "+20% velocita di movimento" },
  { id: "reserve-cells", name: "CELLE DI RISERVA", description: "+30% velocita dei proiettili del player" },
  { id: "power-grid", name: "RETE ENERGETICA", description: "-20% attesa per le strutture adiacenti" },
] as const satisfies readonly StructureUpgrade[];

export class PowerPlant extends OutpostStructure {
  static readonly definition = {
    kind: "power-plant",
    name: "CENTRALE",
    description: "Fuoco e movimento piu rapidi",
    color: COLORS.accent,
  } as const;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, PowerPlant.definition, POWER_PLANT_UPGRADES);
  }

  protected override onInstall(): void {
    this.player.changeMovementMultiplier(0.2);
    this.weapon.changeCooldownMultiplier(-0.2);
  }

  protected override onUninstall(): void {
    this.player.changeMovementMultiplier(this.hasUpgrade("overcharged") ? -0.4 : -0.2);
    this.weapon.changeCooldownMultiplier(0.2);
    if (this.hasUpgrade("reserve-cells")) this.weapon.changeProjectileSpeedMultiplier(-0.3);
    this.setNeighboursFireRate(1);
  }

  protected override onUpdate(_time: number): void {
    if (this.hasUpgrade("power-grid")) this.setNeighboursFireRate(0.8);
  }

  protected override onUpgradeApplied(id: string): void {
    if (id === "overcharged") this.player.changeMovementMultiplier(0.2);
    if (id === "reserve-cells") this.weapon.changeProjectileSpeedMultiplier(0.3);
    if (id === "power-grid") this.setNeighboursFireRate(0.8);
  }

  protected override onUpgradeRemoved(id: string): void {
    if (id === "overcharged") this.player.changeMovementMultiplier(-0.2);
    if (id === "reserve-cells") this.weapon.changeProjectileSpeedMultiplier(-0.3);
    if (id === "power-grid") this.setNeighboursFireRate(1);
  }

  private setNeighboursFireRate(multiplier: number): void {
    const structures = (this.scene.data.get(RUN_DATA.structureSlots) as StructureSlots).getStructures();
    const ownSlot = structures.indexOf(this);
    structures.forEach((structure, slot) => {
      if (structure && Math.abs(slot - ownSlot) === 1) structure.setAdjacentFireRateMultiplier(multiplier);
    });
  }

  private get player(): Player {
    return this.scene.data.get(RUN_DATA.player) as Player;
  }

  private get weapon(): PlayerWeapon {
    return this.scene.data.get(RUN_DATA.weapon) as PlayerWeapon;
  }
}
