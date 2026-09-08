import Phaser from "phaser";
import { COLORS } from "../../constants";

export type StructureKind = "wall" | "power-plant" | "shield" | "drone-factory" | "turret" | "radar" | "ammo-depot";

export interface StructureDefinition {
  kind: StructureKind;
  name: string;
  description: string;
  color: number;
  availableInCards?: boolean;
}

export interface StructureConstructor {
  readonly definition: StructureDefinition;
  new (scene: Phaser.Scene, x: number, y: number): OutpostStructure;
}

export interface StructureUpgrade {
  id: string;
  name: string;
  description: string;
}

/** Base visual and lifecycle for a structure. Structures intentionally have no physics body. */
export abstract class OutpostStructure extends Phaser.GameObjects.Container {
  private readonly upgrades = new Set<string>();

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    readonly definition: StructureDefinition,
    private readonly upgradeDefinitions: readonly StructureUpgrade[],
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

  repair(): void {
    this.onRepair();
  }

  getUpgradeDefinitions(): readonly StructureUpgrade[] {
    return this.upgradeDefinitions;
  }

  hasUpgrade(id: string): boolean {
    return this.upgrades.has(id);
  }

  applyUpgrade(id: string): void {
    if (this.hasUpgrade(id) || !this.getUpgradeDefinitions().some((upgrade) => upgrade.id === id)) {
      return;
    }
    this.upgrades.add(id);
    this.onUpgradeApplied(id);
  }

  /** Hook used by adjacent Power Plants; only automatic structures override it. */
  setAdjacentFireRateMultiplier(_multiplier: number): void {}

  protected onInstall(): void {}

  protected onUpdate(_time: number): void {}

  protected onUninstall(): void {}

  protected onRepair(): void {}

  protected onUpgradeApplied(_id: string): void {}
}
