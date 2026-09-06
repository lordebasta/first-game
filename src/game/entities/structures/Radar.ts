import { COLORS } from "../../constants";
import { RUN_DATA } from "../../RunData";
import { OutpostStructure } from "./OutpostStructure";

export class Radar extends OutpostStructure {
  static readonly definition = {
    kind: "radar",
    name: "RADAR",
    description: "Gli invasori valgono piu punti",
    color: COLORS.player,
  } as const;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, Radar.definition);
  }

  protected override onInstall(): void {
    this.scene.data.inc(RUN_DATA.scoreMultiplier, 0.1);
  }

  protected override onUninstall(): void {
    this.scene.data.inc(RUN_DATA.scoreMultiplier, -0.1);
  }
}
