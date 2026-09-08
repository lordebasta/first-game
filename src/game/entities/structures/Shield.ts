import { COLORS } from "../../constants";
import { Bomb } from "../Bomb";
import { RUN_DATA } from "../../RunData";
import { Enemy } from "../Enemy";
import { OutpostStructure, type StructureUpgrade } from "./OutpostStructure";

const INTERCEPT_BEFORE_CORE_PX = 28;
const STRUCTURE_WIDTH = 178;

export const SHIELD_UPGRADES = [
  { id: "capacity", name: "CAPACITA AUMENTATA", description: "+1 carica di intercettazione" },
  { id: "fast-recharge", name: "RICARICA RAPIDA", description: "Ricarica in 1 ondata anziche 2" },
  { id: "stopping-field", name: "CAMPO DI ARRESTO", description: "Intercetta anche gli invasori" },
] as const satisfies readonly StructureUpgrade[];
// Upgrade rimandati: Riflesso e Conversione energia.

/** Defensive structure that only intercepts Bombardier bombs. */
export class Shield extends OutpostStructure {
  static readonly definition = {
    kind: "shield",
    name: "SCUDO",
    description: "Intercetta una bomba senza danni",
    color: COLORS.player,
  } as const;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, Shield.definition);
  }

  private charges = 1;
  private rechargeProgress = 0;

  override getUpgradeDefinitions(): readonly StructureUpgrade[] {
    return SHIELD_UPGRADES;
  }

  protected override onUpdate(_time: number): void {
    const bombs = this.scene.data.get(RUN_DATA.bombs) as Phaser.Physics.Arcade.Group;
    const coreLineY = this.scene.data.get(RUN_DATA.coreLineY) as number;
    if (this.charges <= 0) return;
    const bomb = (bombs.getChildren() as Bomb[]).find(
      (candidate) =>
        candidate.hasReached(coreLineY - INTERCEPT_BEFORE_CORE_PX) &&
        Math.abs(candidate.x - this.x) <= STRUCTURE_WIDTH / 2,
    );
    if (bomb) {
      bomb.deactivate();
      this.consumeCharge();
      return;
    }
    if (this.hasUpgrade("stopping-field")) {
      const enemies = this.scene.data.get(RUN_DATA.enemies) as Phaser.Physics.Arcade.Group;
      const enemy = (enemies.getChildren() as Enemy[]).find((candidate) =>
        candidate.hasReached(coreLineY - INTERCEPT_BEFORE_CORE_PX) &&
        Math.abs(candidate.x - this.x) <= STRUCTURE_WIDTH / 2);
      if (enemy) {
        enemy.deactivate();
        this.consumeCharge();
      }
    }
  }

  protected override onRepair(): void {
    const maxCharges = this.hasUpgrade("capacity") ? 2 : 1;
    if (this.charges >= maxCharges) return;
    this.rechargeProgress += 1;
    if (this.rechargeProgress >= (this.hasUpgrade("fast-recharge") ? 1 : 2)) {
      this.charges += 1;
      this.rechargeProgress = 0;
      this.setAlpha(1);
    }
  }

  protected override onUpgradeApplied(id: string): void {
    if (id === "capacity") this.charges += 1;
  }

  private consumeCharge(): void {
    this.charges -= 1;
    this.setAlpha(this.charges > 0 ? 0.7 : 0.35);
  }
}
