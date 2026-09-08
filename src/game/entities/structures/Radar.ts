import { COLORS } from "../../constants";
import { RUN_DATA } from "../../RunData";
import { Enemy } from "../Enemy";
import { OutpostStructure, type StructureUpgrade } from "./OutpostStructure";

export const RADAR_UPGRADES = [
  { id: "double-scan", name: "DOPPIA SCANSIONE", description: "Marca anche il secondo nemico piu resistente" },
  { id: "weak-point", name: "PUNTO DEBOLE ESPOSTO", description: "I bersagli marcati ricevono +1x danno" },
  { id: "persistent-lock", name: "AGGANCIO PERSISTENTE", description: "Mantiene i bersagli finche restano attivi" },
] as const satisfies readonly StructureUpgrade[];
// Upgrade rimandati: Allarme bombardiere e Catena di dati.

export class Radar extends OutpostStructure {
  static readonly definition = {
    kind: "radar",
    name: "RADAR",
    description: "Marca il nemico piu resistente e lo rende vulnerabile",
    color: COLORS.player,
  } as const;

  private markedEnemies: Enemy[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, Radar.definition, RADAR_UPGRADES);
  }

  protected override onUpdate(_time: number): void {
    const enemies = (this.scene.data.get(RUN_DATA.enemies) as Phaser.Physics.Arcade.Group)
      .getChildren()
      .filter((object) => object.active) as Enemy[];
    const count = this.hasUpgrade("double-scan") ? 2 : 1;
    const retained = this.hasUpgrade("persistent-lock")
      ? this.markedEnemies.filter((enemy) => enemy.active).slice(0, count)
      : [];
    const targets = [...retained];
    const strongest = [...enemies].sort((a, b) =>
      b.getHealth() - a.getHealth() || b.y - a.y);
    for (const enemy of strongest) {
      if (targets.length >= count) break;
      if (!targets.includes(enemy)) targets.push(enemy);
    }
    if (targets.length === this.markedEnemies.length && targets.every((target, index) => target === this.markedEnemies[index])) return;

    this.markedEnemies.filter((enemy) => !targets.includes(enemy)).forEach((enemy) => enemy.setMarked(false));
    const damageBonus = this.hasUpgrade("weak-point") ? 2 : 1;
    targets.forEach((enemy) => enemy.setMarked(true, damageBonus));
    this.markedEnemies = targets;
  }

  protected override onUninstall(): void {
    this.markedEnemies.forEach((enemy) => enemy.setMarked(false));
    this.markedEnemies = [];
  }

  protected override onUpgradeApplied(_id: string): void {
    // Force an immediate refresh (including a new vulnerability bonus).
    this.markedEnemies.forEach((enemy) => enemy.setMarked(false));
    this.markedEnemies = [];
  }

  protected override onUpgradeRemoved(_id: string): void {
    this.markedEnemies.forEach((enemy) => enemy.setMarked(false));
    this.markedEnemies = [];
  }
}
