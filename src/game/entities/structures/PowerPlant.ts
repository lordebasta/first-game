import { COLORS } from "../../constants";
import { Player } from "../Player";
import { PlayerWeapon } from "../../systems/PlayerWeapon";
import { RUN_DATA } from "../../RunData";
import { OutpostStructure, type StructureUpgrade } from "./OutpostStructure";
import type { StructureSlots } from "../../systems/StructureSlots";
import { Enemy } from "../Enemy";

export const POWER_PLANT_UPGRADES = [
  { id: "overcharged", name: "REATTORE SOVRALIMENTATO", description: "+20% velocita di movimento" },
  { id: "force-wave", name: "ONDA DI FORZA", description: "Ogni 5s rallenta tutti i nemici per 2,5s" },
  { id: "power-grid", name: "RETE ENERGETICA", description: "+33% cadenza per tutte le strutture automatiche" },
] as const satisfies readonly StructureUpgrade[];

const BASE_MOVEMENT_BONUS = 0.2;
const BASE_COOLDOWN_REDUCTION = 0.2;
const OVERCHARGE_MOVEMENT_BONUS = 0.2;
const GRID_FIRE_RATE_MULTIPLIER = 0.75;
const FORCE_WAVE_INTERVAL_MS = 10_000;
const FORCE_WAVE_DURATION_MS = 2_500;

export class PowerPlant extends OutpostStructure {
  static readonly definition = {
    kind: "power-plant",
    name: "CENTRALE",
    description: "+20% movimento e +25% cadenza del player",
    color: COLORS.accent,
    unique: true,
  } as const;

  private nextForceWaveAt = Number.POSITIVE_INFINITY;

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
    this.setStructuresFireRate(1);
  }

  protected override onUpdate(time: number): void {
    if (this.hasUpgrade("power-grid")) this.setStructuresFireRate(GRID_FIRE_RATE_MULTIPLIER);
    if (this.hasUpgrade("force-wave") && time >= this.nextForceWaveAt) {
      this.emitForceWave(time);
      this.nextForceWaveAt = time + FORCE_WAVE_INTERVAL_MS;
    }
  }

  protected override onUpgradeApplied(id: string): void {
    if (id === "overcharged") {
      this.player.changeMovementMultiplier(OVERCHARGE_MOVEMENT_BONUS);
    }
    if (id === "force-wave") this.nextForceWaveAt = this.scene.time.now + FORCE_WAVE_INTERVAL_MS;
    if (id === "power-grid") this.setStructuresFireRate(GRID_FIRE_RATE_MULTIPLIER);
  }

  protected override onUpgradeRemoved(id: string): void {
    if (id === "overcharged") {
      this.player.changeMovementMultiplier(-OVERCHARGE_MOVEMENT_BONUS);
    }
    if (id === "force-wave") this.nextForceWaveAt = Number.POSITIVE_INFINITY;
    if (id === "power-grid") this.setStructuresFireRate(1);
  }

  private setStructuresFireRate(multiplier: number): void {
    const structures = (this.scene.data.get(RUN_DATA.structureSlots) as StructureSlots).getStructures();
    structures.forEach((structure) => structure?.setAutomaticFireRateMultiplier(multiplier));
  }

  private emitForceWave(time: number): void {
    const enemies = this.scene.data.get(RUN_DATA.enemies) as Phaser.Physics.Arcade.Group;
    for (const object of enemies.getChildren()) {
      if (object instanceof Enemy && object.active) object.slowFor(time, FORCE_WAVE_DURATION_MS);
    }
    const wave = this.scene.add.circle(this.x, this.y, 22, COLORS.playerGlow, 0.24)
      .setStrokeStyle(3, COLORS.accent, 0.9)
      .setDepth(5);
    this.scene.tweens.add({
      targets: wave,
      scale: 22,
      alpha: 0,
      duration: 650,
      ease: "Quad.easeOut",
      onComplete: () => wave.destroy(),
    });
  }

  private get player(): Player {
    return this.scene.data.get(RUN_DATA.player) as Player;
  }

  private get weapon(): PlayerWeapon {
    return this.scene.data.get(RUN_DATA.weapon) as PlayerWeapon;
  }
}
