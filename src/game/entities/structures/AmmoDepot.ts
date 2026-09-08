import { COLORS } from "../../constants";
import { RUN_DATA } from "../../RunData";
import { PlayerWeapon } from "../../systems/PlayerWeapon";
import { OutpostStructure, type StructureUpgrade } from "./OutpostStructure";

export const AMMO_DEPOT_UPGRADES = [
  { id: "rapid-supply", name: "RIFORNIMENTO RAPIDO", description: "Spatter ogni 4 attacchi anziche 5" },
  { id: "wide-salvo", name: "SALVA LARGA", description: "Lo spatter spara 5 colpi anziche 3" },
  { id: "heavy-center", name: "COLPO CENTRALE PESANTE", description: "+1 danno al colpo centrale" },
] as const satisfies readonly StructureUpgrade[];

export class AmmoDepot extends OutpostStructure {
  static readonly definition = {
    kind: "ammo-depot",
    name: "DEPOSITO MUNIZIONI",
    description: "Ogni quinto colpo del player diventa una raffica ad area",
    color: COLORS.projectile,
  } as const;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, AmmoDepot.definition, AMMO_DEPOT_UPGRADES);
  }

  protected override onInstall(): void {
    this.refreshWeaponConfiguration();
  }

  protected override onUninstall(): void {
    this.weapon.setAreaShotSource(this);
  }

  protected override onUpgradeApplied(_id: string): void {
    this.refreshWeaponConfiguration();
  }

  private refreshWeaponConfiguration(): void {
    this.weapon.setAreaShotSource(this, {
      every: this.hasUpgrade("rapid-supply") ? 4 : 5,
      count: this.hasUpgrade("wide-salvo") ? 5 : 3,
      centerDamage: this.hasUpgrade("heavy-center") ? 2 : 1,
    });
  }

  private get weapon(): PlayerWeapon {
    return this.scene.data.get(RUN_DATA.weapon) as PlayerWeapon;
  }
}
