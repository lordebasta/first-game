import { COLORS } from "../../constants";
import { Enemy } from "../Enemy";
import { RUN_DATA } from "../../RunData";
import { showExplosion } from "../../graphics/showExplosion";
import { OutpostStructure, type StructureUpgrade } from "./OutpostStructure";

const INTERCEPT_BEFORE_CORE_PX = 28;
const WALL_WIDTH = 178;
const EXPLOSION_RADIUS = 90;

export const WALL_UPGRADES = [
  { id: "reinforced", name: "PIASTRE RINFORZATE", description: "+1 invasore assorbito" },
  { id: "explosive-scraps", name: "ROTTAMI ESPLOSIVI", description: "Esplode quando viene distrutto" },
  { id: "quick-repairs", name: "RIPARAZIONI RAPIDE", description: "+1 integrità recuperata in pausa" },
] as const satisfies readonly StructureUpgrade[];

/** Defensive structure covering the full width of its slot. */
export class Wall extends OutpostStructure {
  static readonly definition = {
    kind: "wall",
    name: "MURO",
    description: "Difesa base dell'avamposto",
    color: COLORS.outpost,
  } as const;

  private integrity = 2;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, Wall.definition);
    const positionLine = scene.add.rectangle(0, -37, WALL_WIDTH, 6, 0x8b5a2b)
      .setStrokeStyle(1, 0xc1844f);
    this.add(positionLine);
  }

  override getUpgradeDefinitions(): readonly StructureUpgrade[] {
    return WALL_UPGRADES;
  }

  protected override onUpdate(_time: number): void {
    if (this.integrity <= 0) {
      return;
    }

    const enemies = this.scene.data.get(RUN_DATA.enemies) as Phaser.Physics.Arcade.Group;
    const coreLineY = this.scene.data.get(RUN_DATA.coreLineY) as number;
    const enemy = (enemies.getChildren() as Enemy[]).find(
      (candidate) =>
        candidate.hasReached(coreLineY - INTERCEPT_BEFORE_CORE_PX) &&
        Math.abs(candidate.x - this.x) <= WALL_WIDTH / 2,
    );
    if (!enemy) {
      return;
    }

    enemy.deactivate();
    this.integrity -= 1;
    this.setAlpha(this.integrity <= 0 ? 0.25 : 0.65);
    if (this.integrity <= 0 && this.hasUpgrade("explosive-scraps")) {
      for (const candidate of enemies.getChildren() as Enemy[]) {
        if (candidate.active && Phaser.Math.Distance.Between(this.x, this.y, candidate.x, candidate.y) <= EXPLOSION_RADIUS) {
          candidate.deactivate();
        }
      }
      showExplosion(this.scene, this.x, this.y, EXPLOSION_RADIUS);
    }
  }

  protected override onRepair(): void {
    const maxIntegrity = this.hasUpgrade("reinforced") ? 3 : 2;
    const recovered = this.hasUpgrade("quick-repairs") ? 2 : 1;
    this.integrity = Math.min(maxIntegrity, this.integrity + recovered);
    this.setAlpha(this.integrity === maxIntegrity ? 1 : 0.65);
  }

  protected override onUpgradeApplied(id: string): void {
    if (id === "reinforced") {
      this.integrity += 1;
      this.setAlpha(1);
    }
  }
}
