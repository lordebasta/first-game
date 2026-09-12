import { COLORS } from "../../constants";
import { Enemy } from "../Enemy";
import { PlayerWeapon } from "../../systems/PlayerWeapon";
import { RUN_DATA } from "../../RunData";
import { OutpostStructure, type StructureUpgrade } from "./OutpostStructure";

const SHOT_INTERVAL_MS = 700;
const TARGETING_HALF_WIDTH = 110;
const PROJECTILE_SPEED = 620 * 1.2;
const MAX_HORIZONTAL_VELOCITY = 220;

export const TURRET_UPGRADES = [
  // { id: "twin", name: "CANNE GEMELLE", description: "+1 proiettile per raffica" }, // DOPO
  // { id: "rapid", name: "MECCANISMO RAPIDO", description: "-25% attesa fra le raffiche" }, // DOPO
  { id: "damage", name: "ALTO IMPATTO", description: "+1 danno per proiettile" },
  { id: "explosive", name: "COLPI ESPLOSIVI", description: "Danno ad area entro 80 pixel" },
  { id: "piercing", name: "COLPI PERFORANTI", description: "Attraversa 1 invasore aggiuntivo" },
  // { id: "stable", name: "STABILIZZATORE", description: "+30% velocita dei proiettili" }, // DOPO
] as const satisfies readonly StructureUpgrade[];
export class Turret extends OutpostStructure {
  static readonly definition = {
    kind: "turret",
    name: "TORRETTA",
    description: "Spara automaticamente verso l'alto",
    color: COLORS.projectile,
    unique: true,
  } as const;

  private nextShotAt = 0;
  private adjacentFireRateMultiplier = 1;

  override setAdjacentFireRateMultiplier(multiplier: number): void {
    this.adjacentFireRateMultiplier = multiplier;
  }

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, Turret.definition, TURRET_UPGRADES);
  }

  protected override onUpdate(time: number): void {
    if (time < this.nextShotAt) {
      return;
    }
    const target = this.findTarget();
    if (!target) return;

    const origin = new Phaser.Math.Vector2(this.x, this.y - 38);
    const travelTime = Math.max(0.08, (origin.y - target.y) / PROJECTILE_SPEED);
    const horizontalVelocity = Phaser.Math.Clamp(
      (target.x - origin.x) / travelTime,
      -MAX_HORIZONTAL_VELOCITY,
      MAX_HORIZONTAL_VELOCITY,
    );
    this.weapon.fireFrom(time, origin, horizontalVelocity, {
      damage: this.hasUpgrade("damage") ? 2 : 1,
      pierce: this.hasUpgrade("piercing") ? 1 : 0,
      explosionRadius: this.hasUpgrade("explosive") ? 80 : 0,
      speedMultiplier: 1.2,
      tint: 0x9fe7ff,
      scale: 0.78,
    });
    this.nextShotAt = time + SHOT_INTERVAL_MS * this.adjacentFireRateMultiplier;
  }

  private findTarget(): Enemy | undefined {
    const enemies = (this.scene.data.get(RUN_DATA.enemies) as Phaser.Physics.Arcade.Group)
      .getChildren()
      .filter((object): object is Enemy =>
        object instanceof Enemy && object.canBeTargetedAutomatically());
    return enemies
      .filter((enemy) => Math.abs(enemy.x - this.x) <= TARGETING_HALF_WIDTH)
      .sort((first, second) => second.y - first.y)[0];
  }

  private get weapon(): PlayerWeapon {
    return this.scene.data.get(RUN_DATA.weapon) as PlayerWeapon;
  }
}
