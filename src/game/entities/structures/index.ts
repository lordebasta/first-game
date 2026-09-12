import Phaser from "phaser";
import { AmmoDepot, AMMO_DEPOT_UPGRADES } from "./AmmoDepot";
import { DroneFactory, DRONE_FACTORY_UPGRADES } from "./DroneFactory";
import { PowerPlant, POWER_PLANT_UPGRADES } from "./PowerPlant";
import { Radar, RADAR_UPGRADES } from "./Radar";
import { type OutpostStructure, type StructureConstructor } from "./OutpostStructure";
import { Turret, TURRET_UPGRADES } from "./Turret";

export { type StructureConstructor, type StructureDefinition } from "./OutpostStructure";

export const STRUCTURE_CLASSES: readonly StructureConstructor[] = [
  PowerPlant,
  DroneFactory,
  Turret,
  Radar,
  AmmoDepot,
];

export const DEV_STRUCTURE_CATALOG = [
  { StructureClass: PowerPlant, upgrades: POWER_PLANT_UPGRADES },
  { StructureClass: DroneFactory, upgrades: DRONE_FACTORY_UPGRADES },
  { StructureClass: Turret, upgrades: TURRET_UPGRADES },
  { StructureClass: Radar, upgrades: RADAR_UPGRADES },
  { StructureClass: AmmoDepot, upgrades: AMMO_DEPOT_UPGRADES },
] as const;

export function createStructure(
  StructureClass: StructureConstructor,
  scene: Phaser.Scene,
  x: number,
  y: number,
): OutpostStructure {
  return new StructureClass(scene, x, y);
}
