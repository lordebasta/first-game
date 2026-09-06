import { COLORS } from "../../constants";
import { PlayerWeapon } from "../../systems/PlayerWeapon";
import { RUN_DATA } from "../../RunData";
import { OutpostStructure } from "./OutpostStructure";

const SHOT_INTERVAL_MS = 900;

export class Turret extends OutpostStructure {
  static readonly definition = {
    kind: "turret",
    name: "TORRETTA",
    description: "Spara automaticamente verso l'alto",
    color: COLORS.projectile,
  } as const;

  private nextShotAt = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, Turret.definition);
  }

  protected override onUpdate(time: number): void {
    if (time < this.nextShotAt) {
      return;
    }
    this.weapon.fireFrom(time, new Phaser.Math.Vector2(this.x, this.y - 38));
    this.nextShotAt = time + SHOT_INTERVAL_MS;
  }

  private get weapon(): PlayerWeapon {
    return this.scene.data.get(RUN_DATA.weapon) as PlayerWeapon;
  }
}
