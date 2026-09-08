import { COLORS, GAME_WIDTH } from "../../constants";
import { Enemy } from "../Enemy";
import { RUN_DATA } from "../../RunData";
import { showExplosion } from "../../graphics/showExplosion";
import { OutpostStructure, type StructureUpgrade } from "./OutpostStructure";

const INTERCEPT_BEFORE_CORE_PX = 28;
const EXPLOSION_RADIUS = 90;

export const WALL_UPGRADES = [
  { id: "reinforced", name: "PIASTRE RINFORZATE", description: "+1 invasore assorbito" },
  { id: "explosive-scraps", name: "ROTTAMI ESPLOSIVI", description: "Esplode quando viene distrutto" },
  { id: "quick-repairs", name: "RIPARAZIONI RAPIDE", description: "+1 integrità recuperata in pausa" },
] as const satisfies readonly StructureUpgrade[];

/** Defensive structure covering the full width of the playfield. */
export class Wall extends OutpostStructure {
  static readonly definition = {
    kind: "wall",
    name: "MURO",
    description: "Difesa base dell'avamposto",
    color: COLORS.outpost,
  } as const;

  private currentHealth = 2;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, Wall.definition, WALL_UPGRADES);
    const positionLine = scene.add.rectangle(GAME_WIDTH / 2 - x, -37, GAME_WIDTH, 6, 0x8b5a2b)
      .setStrokeStyle(1, 0xc1844f);
    this.add(positionLine);
  }

  private get health(): number {
    return this.currentHealth;
  }

  private set health(value: number) {
    this.currentHealth = value;
    const maxHealth = this.hasUpgrade("reinforced") ? 3 : 2;
    this.setAlpha(value <= 0 ? 0.25 : value < maxHealth ? 0.65 : 1);
  }

  protected override onUpdate(_time: number): void {
    if (this.health <= 0) {
      return;
    }

    const enemies = this.scene.data.get(RUN_DATA.enemies) as Phaser.Physics.Arcade.Group;
    const coreLineY = this.scene.data.get(RUN_DATA.coreLineY) as number;
    const enemy = (enemies.getChildren() as Enemy[]).find(
      (candidate) =>
        candidate.hasReached(coreLineY - INTERCEPT_BEFORE_CORE_PX),
    );
    if (!enemy) {
      return;
    }

    const impactPosition = new Phaser.Math.Vector2(enemy.x, enemy.y);
    enemy.deactivate();
    this.health -= 1;
    if (this.health <= 0 && this.hasUpgrade("explosive-scraps")) {
      for (const candidate of enemies.getChildren() as Enemy[]) {
        if (candidate.active && Phaser.Math.Distance.Between(
          impactPosition.x, impactPosition.y, candidate.x, candidate.y,
        ) <= EXPLOSION_RADIUS) {
          candidate.deactivate();
        }
      }
      showExplosion(this.scene, impactPosition.x, impactPosition.y, EXPLOSION_RADIUS);
    }
  }

  protected override onRepair(): void {
    const maxHealth = this.hasUpgrade("reinforced") ? 3 : 2;
    const recovered = this.hasUpgrade("quick-repairs") ? 2 : 1;
    this.health = Math.min(maxHealth, this.health + recovered);
  }

  protected override onUpgradeApplied(id: string): void {
    if (id === "reinforced") {
      this.health += 1;
    }
  }
}
