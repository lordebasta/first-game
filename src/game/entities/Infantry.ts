import Phaser from "phaser";
import { Enemy, type EnemyDefinition } from "./Enemy";

const INFANTRY_DEFINITION: EnemyDefinition = {
  texture: "enemy",
  health: 1,
};

/** Standard invader: its marching formation is directed by EnemySpawner. */
export class Infantry extends Enemy {
  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, INFANTRY_DEFINITION);
  }
}
