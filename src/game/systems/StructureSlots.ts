import Phaser from "phaser";
import { GAME_WIDTH } from "../constants";
import { createStructure, type StructureConstructor, type StructureContext } from "../entities/structures";
import { type OutpostStructure } from "../entities/structures/OutpostStructure";
import { Player } from "../entities/Player";
import { PlayerWeapon } from "./PlayerWeapon";

const SLOT_Y = 625;
const SLOT_X = [170, GAME_WIDTH / 2, 550] as const;

/** Keeps track only of slot occupancy and delegates behaviour to each structure entity. */
export class StructureSlots {
  private readonly structures: Array<OutpostStructure | undefined> = [undefined, undefined, undefined];

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly player: Player,
    private readonly weapon: PlayerWeapon,
    private readonly changeScoreMultiplier: (amount: number) => void,
  ) {
    this.drawSlots();
  }

  update(time: number): void {
    this.structures.forEach((structure) => structure?.update(time));
  }

  place(slot: number, StructureClass: StructureConstructor): void {
    this.structures[slot]?.uninstall();
    const context: StructureContext = {
      player: this.player,
      weapon: this.weapon,
      changeScoreMultiplier: this.changeScoreMultiplier,
    };
    const structure = createStructure(StructureClass, this.scene, SLOT_X[slot], SLOT_Y, context);
    this.structures[slot] = structure;
    structure.install();
  }

  labelFor(slot: number): string {
    return this.structures[slot] ? `SOSTITUISCI ${slot + 1}` : `SLOT ${slot + 1}`;
  }

  private drawSlots(): void {
    SLOT_X.forEach((x, index) => {
      this.scene.add.rectangle(x, SLOT_Y, 178, 52, 0x0b1a2d, 0.55).setStrokeStyle(2, 0x57728d).setDepth(-1);
      this.scene.add
        .text(x, SLOT_Y + 4, `SLOT ${index + 1}`, { color: "#57728d", fontFamily: "monospace", fontSize: "14px" })
        .setOrigin(0.5)
        .setDepth(-1);
    });
  }
}
