import { COLORS } from "../../constants";
import { PlayerWeapon } from "../../systems/PlayerWeapon";
import { RUN_DATA } from "../../RunData";
import { OutpostStructure, type StructureUpgrade } from "./OutpostStructure";

const SHOT_INTERVAL_MS = 900;

export const TURRET_UPGRADES = [
  // { id: "twin", name: "CANNE GEMELLE", description: "+1 proiettile per raffica" }, // DOPO
  // { id: "rapid", name: "MECCANISMO RAPIDO", description: "-25% attesa fra le raffiche" }, // DOPO
  { id: "damage", name: "ALTO IMPATTO", description: "+1 danno per proiettile" },
  { id: "explosive", name: "COLPI ESPLOSIVI", description: "Danno ad area entro 65 pixel" },
  { id: "piercing", name: "COLPI PERFORANTI", description: "Attraversa 1 invasore aggiuntivo" },
  // { id: "stable", name: "STABILIZZATORE", description: "+30% velocita dei proiettili" }, // DOPO
] as const satisfies readonly StructureUpgrade[];
export type TurretUpgradeId = typeof TURRET_UPGRADES[number]["id"];

export class Turret extends OutpostStructure {
  static readonly definition = {
    kind: "turret",
    name: "TORRETTA",
    description: "Spara automaticamente verso l'alto",
    color: COLORS.projectile,
  } as const;

  private nextShotAt = 0;
  private adjacentFireRateMultiplier = 1;

  override getUpgradeDefinitions(): readonly StructureUpgrade[] {
    return TURRET_UPGRADES;
  }

  override setAdjacentFireRateMultiplier(multiplier: number): void {
    this.adjacentFireRateMultiplier = multiplier;
  }

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, Turret.definition);
  }

  protected override onUpdate(time: number): void {
    if (time < this.nextShotAt) {
      return;
    }
    this.weapon.fireFrom(time, new Phaser.Math.Vector2(this.x, this.y - 38), 0, {
      damage: this.hasUpgrade("damage") ? 2 : 1,
      pierce: this.hasUpgrade("piercing") ? 1 : 0,
      explosionRadius: this.hasUpgrade("explosive") ? 65 : 0,
      tint: 0x9fe7ff,
      scale: 0.78,
    });
    this.nextShotAt = time + SHOT_INTERVAL_MS * this.adjacentFireRateMultiplier;
  }

  private get weapon(): PlayerWeapon {
    return this.scene.data.get(RUN_DATA.weapon) as PlayerWeapon;
  }
}
