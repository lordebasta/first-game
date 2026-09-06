import { COLORS } from "../../constants";
import { OutpostStructure } from "./OutpostStructure";

/** Defensive structure. Its interception behaviour will be added with structure hitboxes. */
export class Shield extends OutpostStructure {
  static readonly definition = {
    kind: "shield",
    name: "SCUDO",
    description: "Intercetta un invasore senza danni",
    color: COLORS.player,
  } as const;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, Shield.definition);
  }
}
