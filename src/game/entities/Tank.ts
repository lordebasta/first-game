import Phaser from "phaser";
import { Enemy, type EnemyDefinition } from "./Enemy";

const TANK_HEALTH = 8;

const TANK_DEFINITION: EnemyDefinition = {
  texture: "tank",
  health: TANK_HEALTH,
};

/** Durable front-line invader whose remaining health is always color coded. */
export class Tank extends Enemy {
  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, TANK_DEFINITION);
  }
}
