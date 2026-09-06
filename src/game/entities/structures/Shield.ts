import { COLORS } from "../../constants";
import { Bomb } from "../Bomb";
import { RUN_DATA } from "../../RunData";
import { OutpostStructure } from "./OutpostStructure";

const INTERCEPT_BEFORE_CORE_PX = 28;
const STRUCTURE_WIDTH = 178;

/** Defensive structure that only intercepts Bombardier bombs. */
export class Shield extends OutpostStructure {
  static readonly definition = {
    kind: "shield",
    name: "SCUDO",
    description: "Intercetta una bomba senza danni",
    color: COLORS.player,
  } as const;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, Shield.definition);
  }

  protected override onUpdate(_time: number): void {
    const bombs = this.scene.data.get(RUN_DATA.bombs) as Phaser.Physics.Arcade.Group;
    const coreLineY = this.scene.data.get(RUN_DATA.coreLineY) as number;
    const bomb = (bombs.getChildren() as Bomb[]).find(
      (candidate) =>
        candidate.hasReached(coreLineY - INTERCEPT_BEFORE_CORE_PX) &&
        Math.abs(candidate.x - this.x) <= STRUCTURE_WIDTH / 2,
    );
    bomb?.deactivate();
  }
}
