import Phaser from "phaser";
import { PowerPlant } from "./PowerPlant";
import { Radar } from "./Radar";
import { type OutpostStructure, type StructureConstructor, type StructureContext } from "./OutpostStructure";
import { Turret } from "./Turret";

export { type StructureConstructor, type StructureDefinition, type StructureContext } from "./OutpostStructure";

export const STRUCTURE_CLASSES: readonly StructureConstructor[] = [PowerPlant, Turret, Radar];

export function createStructure(
  StructureClass: StructureConstructor,
  scene: Phaser.Scene,
  x: number,
  y: number,
  context: StructureContext,
): OutpostStructure {
  return new StructureClass(scene, x, y, context);
}
