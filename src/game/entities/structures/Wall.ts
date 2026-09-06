import { COLORS } from "../../constants";
import { Enemy } from "../Enemy";
import { RUN_DATA } from "../../RunData";
import { OutpostStructure } from "./OutpostStructure";

const INTERCEPT_BEFORE_CORE_PX = 28;

/** Defensive structure. Its collision behaviour will be added with structure hitboxes. */
export class Wall extends OutpostStructure {
  static readonly definition = {
    kind: "wall",
    name: "MURO",
    description: "Difesa base dell'avamposto",
    color: COLORS.outpost,
  } as const;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, Wall.definition);
  }

  private destroyed = false;

  protected override onUpdate(_time: number): void {
    if (this.destroyed) {
      return;
    }

    const enemies = this.scene.data.get(RUN_DATA.enemies) as Phaser.Physics.Arcade.Group;
    const coreLineY = this.scene.data.get(RUN_DATA.coreLineY) as number;
    const enemy = (enemies.getChildren() as Enemy[]).find(
      (candidate) =>
        candidate.hasReached(coreLineY - INTERCEPT_BEFORE_CORE_PX)
    );
    if (!enemy) {
      return;
    }

    enemy.deactivate();
    this.destroyed = true;
    this.setAlpha(0.25);
  }

  protected override onRepair(): void {
    this.destroyed = false;
    this.setAlpha(1);
  }
}
