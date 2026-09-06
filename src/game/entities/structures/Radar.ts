import { COLORS } from "../../constants";
import { RUN_DATA } from "../../RunData";
import { Enemy } from "../Enemy";
import { OutpostStructure } from "./OutpostStructure";

export class Radar extends OutpostStructure {
  static readonly definition = {
    kind: "radar",
    name: "RADAR",
    description: "Marca il nemico piu resistente e lo rende vulnerabile",
    color: COLORS.player,
  } as const;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, Radar.definition);
  }

  private markedEnemy?: Enemy;

  protected override onUpdate(_time: number): void {
    const enemies = (this.scene.data.get(RUN_DATA.enemies) as Phaser.Physics.Arcade.Group)
      .getChildren()
      .filter((object) => object.active) as Enemy[];
    const target = enemies.reduce<Enemy | undefined>(
      (strongest, enemy) => (!strongest || enemy.getHealth() > strongest.getHealth() ? enemy : strongest),
      undefined,
    );

    if (target === this.markedEnemy) {
      return;
    }

    this.markedEnemy?.setMarked(false);
    target?.setMarked(true);
    this.markedEnemy = target;
  }

  protected override onUninstall(): void {
    this.markedEnemy?.setMarked(false);
    this.markedEnemy = undefined;
  }
}
