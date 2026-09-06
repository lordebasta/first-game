import { COLORS } from "../../constants";
import { OutpostStructure, type StructureContext } from "./OutpostStructure";

export class Radar extends OutpostStructure {
  static readonly definition = {
    kind: "radar",
    name: "RADAR",
    description: "Gli invasori valgono piu punti",
    color: COLORS.player,
  } as const;

  private readonly changeScoreMultiplier: (amount: number) => void;

  constructor(scene: Phaser.Scene, x: number, y: number, context: StructureContext) {
    super(scene, x, y, Radar.definition);
    this.changeScoreMultiplier = context.changeScoreMultiplier;
  }

  protected override onInstall(): void {
    this.changeScoreMultiplier(1);
  }

  protected override onUninstall(): void {
    this.changeScoreMultiplier(-1);
  }
}
