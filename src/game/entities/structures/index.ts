import Phaser from "phaser";
import { AmmoDepot } from "./AmmoDepot";
import { DroneFactory } from "./DroneFactory";
import { PowerPlant } from "./PowerPlant";
import { Radar } from "./Radar";
import { type OutpostStructure, type StructureConstructor } from "./OutpostStructure";
import { Turret } from "./Turret";
import { Wall } from "./Wall";

export { type StructureConstructor, type StructureDefinition } from "./OutpostStructure";

export const STRUCTURE_CLASSES: readonly StructureConstructor[] = [
  Wall,
  PowerPlant,
  DroneFactory,
  Turret,
  Radar,
  AmmoDepot,
];

export function createStructure(
  StructureClass: StructureConstructor,
  scene: Phaser.Scene,
  x: number,
  y: number,
): OutpostStructure {
  return new StructureClass(scene, x, y);
}
