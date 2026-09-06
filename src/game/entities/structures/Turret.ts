import { COLORS } from "../../constants";
import { PlayerWeapon } from "../../systems/PlayerWeapon";
import { OutpostStructure, type StructureContext } from "./OutpostStructure";

const SHOT_INTERVAL_MS = 900;

export class Turret extends OutpostStructure {
  static readonly definition = {
    kind: "turret",
    name: "TORRETTA",
    description: "Spara automaticamente verso l'alto",
    color: COLORS.projectile,
  } as const;

  private nextShotAt = 0;
  private readonly weapon: PlayerWeapon;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    context: StructureContext,
  ) {
    super(scene, x, y, Turret.definition);
    this.weapon = context.weapon;
  }

  protected override onUpdate(time: number): void {
    if (time < this.nextShotAt) {
      return;
    }
    this.weapon.fireFrom(time, new Phaser.Math.Vector2(this.x, this.y - 38));
    this.nextShotAt = time + SHOT_INTERVAL_MS;
  }
}
