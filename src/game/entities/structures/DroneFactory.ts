import { Drone } from "../Drone";
import { Enemy } from "../Enemy";
import { COLORS } from "../../constants";
import { RUN_DATA } from "../../RunData";
import { PlayerWeapon } from "../../systems/PlayerWeapon";
import { OutpostStructure, type StructureUpgrade } from "./OutpostStructure";

export const DRONE_FACTORY_UPGRADES = [
  { id: "assembly-line", name: "LINEA DI ASSEMBLAGGIO", description: "+1 drone" },
  { id: "instant-laser", name: "LASER ISTANTANEO", description: "I droni colpiscono senza proiettile" },
  { id: "priority-targeting", name: "PUNTAMENTO PRIORITARIO", description: "Alterna priorita base o vita con un click" },
] as const satisfies readonly StructureUpgrade[];
// Upgrade laser rimandati: Laser focalizzato, Raffreddamento efficiente e Laser perforante.

export class DroneFactory extends OutpostStructure {
  static readonly definition = {
    kind: "drone-factory",
    name: "FABBRICA DRONI",
    description: "Un drone punta e spara al nemico piu in basso",
    color: COLORS.accent,
  } as const;

  private readonly drones: Drone[] = [];
  private priority: "lowest" | "strongest" = "lowest";
  private priorityButton?: Phaser.GameObjects.Text;
  private adjacentFireRateMultiplier = 1;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, DroneFactory.definition);
  }

  override getUpgradeDefinitions(): readonly StructureUpgrade[] {
    return DRONE_FACTORY_UPGRADES;
  }

  override setAdjacentFireRateMultiplier(multiplier: number): void {
    this.adjacentFireRateMultiplier = multiplier;
  }

  protected override onInstall(): void {
    const weapon = this.scene.data.get(RUN_DATA.weapon) as PlayerWeapon;
    this.drones.push(new Drone(this.scene, this.x, weapon));
  }

  protected override onUpdate(time: number): void {
    const group = this.scene.data.get(RUN_DATA.enemies) as Phaser.Physics.Arcade.Group;
    const enemies = group.getChildren().filter((object) => object.active) as Enemy[];
    for (const drone of this.drones) {
      drone.update(time, enemies, {
        laser: this.hasUpgrade("instant-laser"),
        priority: this.priority,
        fireRateMultiplier: this.adjacentFireRateMultiplier,
      });
    }
  }

  protected override onUninstall(): void {
    this.drones.forEach((drone) => drone.destroy());
    this.drones.length = 0;
    this.priorityButton?.destroy();
  }

  protected override onUpgradeApplied(id: string): void {
    if (id === "assembly-line") {
      this.drones.push(new Drone(this.scene, this.x + 24, this.weapon));
    }
    if (id === "priority-targeting") {
      this.priorityButton = this.scene.add
        .text(this.x, this.y - 61, "PRIORITA: BASE", {
          color: "#9fe7ff", fontFamily: "monospace", fontSize: "11px", backgroundColor: "#10233d",
        })
        .setOrigin(0.5)
        .setPadding(5, 3)
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", () => {
          this.priority = this.priority === "lowest" ? "strongest" : "lowest";
          this.priorityButton?.setText(this.priority === "lowest" ? "PRIORITA: BASE" : "PRIORITA: VITA");
        });
    }
  }

  private get weapon(): PlayerWeapon {
    return this.scene.data.get(RUN_DATA.weapon) as PlayerWeapon;
  }
}
