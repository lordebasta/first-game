import Phaser from "phaser";
import { COLORS } from "../../constants";
import { RUN_DATA } from "../../RunData";
import { ExplosionSystem } from "../../systems/ExplosionSystem";
import { Enemy } from "../Enemy";
import { Player } from "../Player";
import { OutpostStructure, type StructureUpgrade } from "./OutpostStructure";

const CHARGE_MS = 1_800;
const CHARGE_RADIUS = 80;
const FLIGHT_MS = 400;
const BLAST_RADIUS = 80;
const SHRAPNEL_RADIUS = 100;
const DIRECT_DAMAGE = 3;
const HEAVY_SHELL_DAMAGE = 5;
const EMITTER_Y = -43;
const BAR_WIDTH = 108;

interface MortarShell {
  target: Enemy;
  x: number;
  y: number;
  blastRadius: number;
  directDamage: number;
  elapsedMs: number;
  sprite: Phaser.GameObjects.Arc;
}

export const MORTAR_UPGRADES = [
  { id: "shrapnel", name: "SCHEGGE", description: "Raggio esplosione 100 px anziche 80" },
  { id: "heavy-shell", name: "PROIETTILE PESANTE", description: "Danno diretto 5 anziche 3; danno ad area 2 anziche 1" },
  { id: "ballistic-computer", name: "CALCOLO BALISTICO", description: "Fra i bersagli piu resistenti, sceglie l'area con piu nemici" },
] as const satisfies readonly StructureUpgrade[];

/** A player-charged mortar that fires at the toughest enemy and damages nearby enemies. */
export class Mortar extends OutpostStructure {
  static readonly definition = {
    kind: "mortar",
    name: "MORTAIO",
    description: "Vicino al player carica un colpo ad area contro il nemico piu resistente",
    color: 0xff9f43,
    unique: true,
  } as const;

  private readonly chargeFill: Phaser.GameObjects.Rectangle;
  private readonly chargeText: Phaser.GameObjects.Text;
  private readonly emitter: Phaser.GameObjects.Arc;
  private readonly explosions: ExplosionSystem;
  private chargeMs = 0;
  private automaticFireRateMultiplier = 1;
  private shownPercent = -1;
  private shell?: MortarShell;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    const barBack = scene.add.rectangle(-70, -16, BAR_WIDTH, 8, 0x07111f)
      .setOrigin(0, 0.5)
      .setStrokeStyle(1, 0x69829d);
    const chargeFill = scene.add.rectangle(-70, -16, BAR_WIDTH, 6, Mortar.definition.color)
      .setOrigin(0, 0.5)
      .setScale(0, 1);
    const chargeText = scene.add.text(44, -16, "0%", {
      color: "#e8f7ff", fontFamily: "monospace", fontSize: "11px", fontStyle: "bold",
    }).setOrigin(0, 0.5);
    const emitter = scene.add.circle(0, EMITTER_Y, 7, COLORS.panel)
      .setStrokeStyle(2, Mortar.definition.color, 0.5);
    super(scene, x, y, Mortar.definition, MORTAR_UPGRADES);
    this.add([barBack, chargeFill, chargeText, emitter]);
    this.chargeFill = chargeFill;
    this.chargeText = chargeText;
    this.emitter = emitter;
    this.explosions = new ExplosionSystem(scene);
    this.refreshChargeDisplay(false);
  }

  override setAutomaticFireRateMultiplier(multiplier: number): void {
    this.automaticFireRateMultiplier = multiplier;
  }

  protected override onUpdate(_time: number, delta: number): void {
    this.updateShell(delta);
    const nearby = Math.abs(this.player.x - this.x) <= CHARGE_RADIUS;
    if (nearby) this.chargeMs = Math.min(this.requiredChargeMs, this.chargeMs + Math.max(0, delta));
    this.refreshChargeDisplay(nearby);
    if (!nearby || this.chargeMs < this.requiredChargeMs || this.shell) return;

    const allEnemies = (this.scene.data.get(RUN_DATA.enemies) as Phaser.Physics.Arcade.Group)
      .getChildren()
      .filter((object): object is Enemy =>
        object instanceof Enemy && object.active);
    const targetable = allEnemies.filter((enemy) =>
      enemy.canBeTargetedAutomatically() && enemy.y < this.y + EMITTER_Y);
    const target = this.chooseTarget(targetable, allEnemies);
    if (!target) return;

    this.fireAt(target);
    this.chargeMs = 0;
    this.refreshChargeDisplay(nearby);
  }

  protected override onUninstall(): void {
    this.shell?.sprite.destroy();
    this.shell = undefined;
  }

  private chooseTarget(targetable: readonly Enemy[], allEnemies: readonly Enemy[]): Enemy | undefined {
    if (targetable.length === 0) return undefined;
    const maxHealth = Math.max(...targetable.map((enemy) => enemy.getHealth()));
    const candidates = targetable.filter((enemy) => enemy.getHealth() === maxHealth);
    if (!this.hasUpgrade("ballistic-computer")) {
      return candidates.reduce((best, enemy) => enemy.y > best.y ? enemy : best);
    }
    const targetsInBlast = (candidate: Enemy): number => allEnemies.filter((enemy) =>
      Phaser.Math.Distance.Between(candidate.x, candidate.y, enemy.x, enemy.y) <= this.blastRadius).length;
    return candidates.reduce((best, enemy) => {
      const hits = targetsInBlast(enemy);
      const bestHits = targetsInBlast(best);
      return hits > bestHits || (hits === bestHits && enemy.y > best.y) ? enemy : best;
    });
  }

  private fireAt(target: Enemy): void {
    const sprite = this.scene.add.circle(this.x, this.y + EMITTER_Y, 6, Mortar.definition.color)
      .setStrokeStyle(2, 0xffffff)
      .setDepth(7);
    this.shell = {
      target, x: target.x, y: target.y,
      blastRadius: this.blastRadius,
      directDamage: this.hasUpgrade("heavy-shell") ? HEAVY_SHELL_DAMAGE : DIRECT_DAMAGE,
      elapsedMs: 0, sprite,
    };
  }

  private updateShell(delta: number): void {
    const shell = this.shell;
    if (!shell) return;
    shell.elapsedMs += Math.max(0, delta);
    const progress = Math.min(1, shell.elapsedMs / FLIGHT_MS);
    const remaining = 1 - progress;
    const startY = this.y + EMITTER_Y;
    const controlX = (this.x + shell.x) / 2;
    const controlY = Math.min(startY, shell.y) - 90;
    shell.sprite.setPosition(
      remaining * remaining * this.x + 2 * remaining * progress * controlX + progress * progress * shell.x,
      remaining * remaining * startY + 2 * remaining * progress * controlY + progress * progress * shell.y,
    );
    if (progress < 1) return;

    shell.sprite.destroy();
    this.shell = undefined;
    if (shell.target.active && Phaser.Math.Distance.Between(shell.x, shell.y, shell.target.x, shell.target.y) <= shell.blastRadius) {
      shell.target.receiveHit({ damage: shell.directDamage, source: this });
    }
    this.explosions.explode(
      new Phaser.Math.Vector2(shell.x, shell.y),
      shell.blastRadius,
      { damage: Math.floor(shell.directDamage / 2), source: this },
      shell.target,
    );
  }

  private refreshChargeDisplay(nearby: boolean): void {
    const progress = Math.min(1, this.chargeMs / this.requiredChargeMs);
    const percent = Math.floor(progress * 100);
    this.chargeFill.setScale(progress, 1).setAlpha(nearby ? 1 : 0.45);
    this.chargeFill.setFillStyle(progress === 1 ? COLORS.accent : Mortar.definition.color);
    if (percent !== this.shownPercent) {
      this.chargeText.setText(percent === 100 ? "OK" : `${percent}%`);
      this.shownPercent = percent;
    }
    this.chargeText.setAlpha(nearby ? 1 : 0.6);
    this.emitter.setFillStyle(
      progress === 1 && nearby ? COLORS.accent : Mortar.definition.color,
      nearby ? 0.95 : 0.2,
    );
    this.emitter.setStrokeStyle(nearby ? 3 : 2, Mortar.definition.color, nearby ? 1 : 0.5);
  }

  private get requiredChargeMs(): number {
    return CHARGE_MS * this.automaticFireRateMultiplier;
  }

  private get blastRadius(): number {
    return this.hasUpgrade("shrapnel") ? SHRAPNEL_RADIUS : BLAST_RADIUS;
  }

  private get player(): Player {
    return this.scene.data.get(RUN_DATA.player) as Player;
  }
}
