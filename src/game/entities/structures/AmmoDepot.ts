import { COLORS } from "../../constants";
import { RUN_DATA } from "../../RunData";
import { PlayerWeapon } from "../../systems/PlayerWeapon";
import { OutpostStructure } from "./OutpostStructure";

export class AmmoDepot extends OutpostStructure {
  static readonly definition = {
    kind: "ammo-depot",
    name: "DEPOSITO MUNIZIONI",
    description: "Ogni quinto colpo del player diventa una raffica ad area",
    color: COLORS.projectile,
  } as const;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, AmmoDepot.definition);
  }

  protected override onInstall(): void {
    this.weapon.setAreaShotEvery(5);
  }

  protected override onUninstall(): void {
    this.weapon.setAreaShotEvery(undefined);
  }

  private get weapon(): PlayerWeapon {
    return this.scene.data.get(RUN_DATA.weapon) as PlayerWeapon;
  }
}
