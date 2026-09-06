import Phaser from "phaser";
import { COLORS } from "../../constants";
import type { Player } from "../Player";
import type { PlayerWeapon } from "../../systems/PlayerWeapon";

export type StructureKind = "power-plant" | "turret" | "radar";

export interface StructureDefinition {
  kind: StructureKind;
  name: string;
  description: string;
  color: number;
}

export interface StructureContext {
  player: Player;
  weapon: PlayerWeapon;
  changeScoreMultiplier: (amount: number) => void;
}

export interface StructureConstructor {
  readonly definition: StructureDefinition;
  new (scene: Phaser.Scene, x: number, y: number, context: StructureContext): OutpostStructure;
}

/** Base visual and lifecycle for a structure. Structures intentionally have no physics body. */
export abstract class OutpostStructure extends Phaser.GameObjects.Container {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    readonly definition: StructureDefinition,
  ) {
    const base = scene.add.rectangle(0, 0, 178, 52, COLORS.panel).setStrokeStyle(3, definition.color);
    const roof = scene.add.triangle(0, -29, 0, 18, 42, 18, 21, 0, definition.color);
    const label = scene.add
      .text(0, 7, definition.name, {
        color: "#e8f7ff",
        fontFamily: "monospace",
        fontSize: "14px",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    super(scene, x, y, [base, roof, label]);
    scene.add.existing(this);
  }

  install(): void {
    this.onInstall();
  }

  update(time: number): void {
    this.onUpdate(time);
  }

  uninstall(): void {
    this.onUninstall();
    this.destroy();
  }

  protected onInstall(): void {}

  protected onUpdate(_time: number): void {}

  protected onUninstall(): void {}
}
