import { COLORS } from "../../constants";
import { Player } from "../Player";
import { PlayerWeapon } from "../../systems/PlayerWeapon";
import { OutpostStructure, type StructureContext } from "./OutpostStructure";

export class PowerPlant extends OutpostStructure {
  static readonly definition = {
    kind: "power-plant",
    name: "CENTRALE",
    description: "Fuoco e movimento piu rapidi",
    color: COLORS.accent,
  } as const;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    context: StructureContext,
  ) {
    super(scene, x, y, PowerPlant.definition);
    this.player = context.player;
    this.weapon = context.weapon;
  }

  private readonly player: Player;
  private readonly weapon: PlayerWeapon;

  protected override onInstall(): void {
    this.player.changeMovementMultiplier(0.2);
    this.weapon.changeCooldownMultiplier(-0.2);
  }

  protected override onUninstall(): void {
    this.player.changeMovementMultiplier(-0.2);
    this.weapon.changeCooldownMultiplier(0.2);
  }
}
