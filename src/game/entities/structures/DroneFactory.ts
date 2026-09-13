import { Drone } from "../Drone";
import { Enemy } from "../Enemy";
import { Bomb } from "../Bomb";
import { COLORS } from "../../constants";
import { RUN_DATA } from "../../RunData";
import { PlayerWeapon } from "../../systems/PlayerWeapon";
import { OutpostStructure, type StructureUpgrade } from "./OutpostStructure";

export const DRONE_FACTORY_UPGRADES = [
  { id: "assembly-line", name: "LINEA DI ASSEMBLAGGIO", description: "+1 drone" },
  { id: "instant-laser", name: "LASER ISTANTANEO", description: "I droni colpiscono senza proiettile" },
  { id: "bomb-hunter", name: "CACCIABOMBE", description: "Da priorita alle bombe e le distrugge al primo colpo" },
] as const satisfies readonly StructureUpgrade[];
// Upgrade laser rimandati: Laser focalizzato, Raffreddamento efficiente e Laser perforante.

export class DroneFactory extends OutpostStructure {
  static readonly definition = {
    kind: "drone-factory",
    name: "FABBRICA DRONI",
    description: "Un drone punta e spara al nemico piu in basso",
    color: COLORS.accent,
    unique: true,
  } as const;

  private readonly drones: Drone[] = [];
  private automaticFireRateMultiplier = 1;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, DroneFactory.definition, DRONE_FACTORY_UPGRADES);
  }

  override setAutomaticFireRateMultiplier(multiplier: number): void {
    this.automaticFireRateMultiplier = multiplier;
  }

  protected override onInstall(): void {
    const weapon = this.scene.data.get(RUN_DATA.weapon) as PlayerWeapon;
    this.drones.push(new Drone(this.scene, this.x, weapon));
  }

  protected override onUpdate(time: number): void {
    const group = this.scene.data.get(RUN_DATA.enemies) as Phaser.Physics.Arcade.Group;
    const enemies = group.getChildren().filter((object) => object.active) as Enemy[];
    const reservedBombs = new Set<Bomb>();
    for (const drone of this.drones) {
      drone.update(time, enemies, {
        laser: this.hasUpgrade("instant-laser"),
        fireRateMultiplier: this.automaticFireRateMultiplier,
        bombHunter: this.hasUpgrade("bomb-hunter"),
        reservedBombs,
      });
    }
  }

  protected override onUninstall(): void {
    this.drones.forEach((drone) => drone.destroy());
    this.drones.length = 0;
  }

  protected override onUpgradeApplied(id: string): void {
    if (id === "assembly-line") {
      this.drones.push(new Drone(this.scene, this.x + 24, this.weapon));
    }
  }

  protected override onUpgradeRemoved(id: string): void {
    if (id === "assembly-line") this.drones.pop()?.destroy();
  }

  private get weapon(): PlayerWeapon {
    return this.scene.data.get(RUN_DATA.weapon) as PlayerWeapon;
  }
}
