import { COLORS } from "../../constants";
import { Player } from "../Player";
import { PlayerWeapon } from "../../systems/PlayerWeapon";
import { RUN_DATA } from "../../RunData";
import { OutpostStructure, type StructureUpgrade } from "./OutpostStructure";
import type { StructureSlots } from "../../systems/StructureSlots";

export const POWER_PLANT_UPGRADES = [
  { id: "overcharged", name: "REATTORE SOVRALIMENTATO", description: "+20% velocita di movimento" },
  { id: "reserve-cells", name: "CELLE DI RISERVA", description: "+40% velocita dei proiettili del player" },
  { id: "power-grid", name: "RETE ENERGETICA", description: "+33% cadenza per le strutture adiacenti" },
] as const satisfies readonly StructureUpgrade[];

const BASE_MOVEMENT_BONUS = 0.2;
const BASE_COOLDOWN_REDUCTION = 0.2;
const OVERCHARGE_MOVEMENT_BONUS = 0.2;
const PROJECTILE_SPEED_BONUS = 0.4;
const ADJACENT_FIRE_RATE_MULTIPLIER = 0.75;

export class PowerPlant extends OutpostStructure {
  static readonly definition = {
    kind: "power-plant",
    name: "CENTRALE",
    description: "+20% movimento e +25% cadenza del player",
    color: COLORS.accent,
    unique: true,
  } as const;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, PowerPlant.definition, POWER_PLANT_UPGRADES);
  }

  protected override onInstall(): void {
    this.player.changeMovementMultiplier(BASE_MOVEMENT_BONUS);
    this.weapon.changeCooldownMultiplier(-BASE_COOLDOWN_REDUCTION);
  }

  protected override onUninstall(): void {
    this.player.changeMovementMultiplier(-BASE_MOVEMENT_BONUS);
    this.weapon.changeCooldownMultiplier(BASE_COOLDOWN_REDUCTION);
    if (this.hasUpgrade("overcharged")) {
      this.player.changeMovementMultiplier(-OVERCHARGE_MOVEMENT_BONUS);
    }
    if (this.hasUpgrade("reserve-cells")) this.weapon.changeProjectileSpeedMultiplier(-PROJECTILE_SPEED_BONUS);
    this.setNeighboursFireRate(1);
  }

  protected override onUpdate(_time: number): void {
    if (this.hasUpgrade("power-grid")) this.setNeighboursFireRate(ADJACENT_FIRE_RATE_MULTIPLIER);
  }

  protected override onUpgradeApplied(id: string): void {
    if (id === "overcharged") {
      this.player.changeMovementMultiplier(OVERCHARGE_MOVEMENT_BONUS);
    }
    if (id === "reserve-cells") this.weapon.changeProjectileSpeedMultiplier(PROJECTILE_SPEED_BONUS);
    if (id === "power-grid") this.setNeighboursFireRate(ADJACENT_FIRE_RATE_MULTIPLIER);
  }

  protected override onUpgradeRemoved(id: string): void {
    if (id === "overcharged") {
      this.player.changeMovementMultiplier(-OVERCHARGE_MOVEMENT_BONUS);
    }
    if (id === "reserve-cells") this.weapon.changeProjectileSpeedMultiplier(-PROJECTILE_SPEED_BONUS);
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
