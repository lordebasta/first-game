import { Drone } from "../Drone";
import { Enemy } from "../Enemy";
import { COLORS } from "../../constants";
import { RUN_DATA } from "../../RunData";
import { PlayerWeapon } from "../../systems/PlayerWeapon";
import { OutpostStructure } from "./OutpostStructure";

export class DroneFactory extends OutpostStructure {
  static readonly definition = {
    kind: "drone-factory",
    name: "FABBRICA DRONI",
    description: "Un drone punta e spara al nemico piu in basso",
    color: COLORS.accent,
  } as const;

  private drone?: Drone;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, DroneFactory.definition);
  }

  protected override onInstall(): void {
    const weapon = this.scene.data.get(RUN_DATA.weapon) as PlayerWeapon;
    this.drone = new Drone(this.scene, this.x, weapon);
  }

  protected override onUpdate(time: number): void {
    const group = this.scene.data.get(RUN_DATA.enemies) as Phaser.Physics.Arcade.Group;
    const enemies = group.getChildren().filter((object) => object.active) as Enemy[];
    this.drone?.update(time, enemies);
  }

  protected override onUninstall(): void {
    this.drone?.destroy();
  }
}
