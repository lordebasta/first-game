import Phaser from "phaser";
import { playLaserSound } from "../../audio/SoundEffects";
import { COLORS, GAME_WIDTH } from "../../constants";
import { RUN_DATA } from "../../RunData";
import { Enemy } from "../Enemy";
import { Player } from "../Player";
import { OutpostStructure, type StructureUpgrade } from "./OutpostStructure";

const CHARGE_MS = 500;
const LASER_DAMAGE = 1;
const CHARGE_RADIUS = 80;
const EXTENDED_RADIUS = 110;
const BEAM_WIDTH = 14;
const RECOVERY_FRACTION = 0.35;
const RECOVERY_HITS = 3;
const EMITTER_Y = -43;
const BAR_WIDTH = 108;

export const LASER_ARRAY_UPGRADES = [
  { id: "energy-recovery", name: "RECUPERO ENERGIA", description: "Se colpisce 3 nemici, recupera il 35% della carica" },
  { id: "line-finder", name: "CERCA LINEA", description: "Fra i bersagli piu resistenti, sceglie la linea che colpisce piu nemici" },
  { id: "extended-coil", name: "BOBINA ESTESA", description: "Si carica col player entro 110 px anziche 80" },
] as const satisfies readonly StructureUpgrade[];

/** A player-powered automatic laser that fires through every enemy along one line. */
export class LaserArray extends OutpostStructure {
  static readonly definition = {
    kind: "laser-array",
    name: "BATTERIA LASER",
    description: "Vicino al player si carica e colpisce in linea il nemico piu resistente",
    color: 0xb890ff,
    unique: true,
  } as const;

  private readonly chargeFill: Phaser.GameObjects.Rectangle;
  private readonly chargeText: Phaser.GameObjects.Text;
  private readonly emitter: Phaser.GameObjects.Arc;
  private chargeMs = 0;
  private automaticFireRateMultiplier = 1;
  private shownPercent = -1;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    const barBack = scene.add.rectangle(-70, -16, BAR_WIDTH, 8, 0x07111f)
      .setOrigin(0, 0.5)
      .setStrokeStyle(1, 0x69829d);
    const chargeFill = scene.add.rectangle(-70, -16, BAR_WIDTH, 6, LaserArray.definition.color)
      .setOrigin(0, 0.5)
      .setScale(0, 1);
    const chargeText = scene.add.text(44, -16, "0%", {
      color: "#e8f7ff", fontFamily: "monospace", fontSize: "11px", fontStyle: "bold",
    }).setOrigin(0, 0.5);
    const emitter = scene.add.circle(0, EMITTER_Y, 7, COLORS.panel)
      .setStrokeStyle(2, LaserArray.definition.color, 0.5);
    super(scene, x, y, LaserArray.definition, LASER_ARRAY_UPGRADES);
    this.add([barBack, chargeFill, chargeText, emitter]);
    this.chargeFill = chargeFill;
    this.chargeText = chargeText;
    this.emitter = emitter;
    this.refreshChargeDisplay(false);
  }

  override setAutomaticFireRateMultiplier(multiplier: number): void {
    this.automaticFireRateMultiplier = multiplier;
  }

  protected override onUpdate(_time: number, delta: number): void {
    const nearby = Math.abs(this.player.x - this.x) <= this.chargeRadius;
    if (nearby) this.chargeMs = Math.min(this.requiredChargeMs, this.chargeMs + Math.max(0, delta));
    this.refreshChargeDisplay(nearby);
    if (!nearby || this.chargeMs < this.requiredChargeMs) return;

    const enemies = (this.scene.data.get(RUN_DATA.enemies) as Phaser.Physics.Arcade.Group)
      .getChildren()
      .filter((object): object is Enemy =>
        object instanceof Enemy && object.canBeTargetedAutomatically() && object.y < this.y + EMITTER_Y);
    const target = this.chooseTarget(enemies);
    if (!target) return;

    const hits = this.fireLaser(target, enemies);
    this.chargeMs = this.hasUpgrade("energy-recovery") && hits >= RECOVERY_HITS
      ? this.requiredChargeMs * RECOVERY_FRACTION
      : 0;
    this.refreshChargeDisplay(nearby);
  }

  private chooseTarget(enemies: readonly Enemy[]): Enemy | undefined {
    if (enemies.length === 0) return undefined;
    const maxHealth = Math.max(...enemies.map((enemy) => enemy.getHealth()));
    const candidates = enemies.filter((enemy) => enemy.getHealth() === maxHealth);
    if (!this.hasUpgrade("line-finder")) {
      return candidates.reduce((best, enemy) => enemy.y > best.y ? enemy : best);
    }

    let best = candidates[0];
    let bestHits = -1;
    for (const candidate of candidates) {
      const end = this.beamEnd(candidate);
      const hits = enemies.filter((enemy) => this.beamIntersects(enemy, end)).length;
      if (hits > bestHits || (hits === bestHits && candidate.y > best.y)) {
        best = candidate;
        bestHits = hits;
      }
    }
    return best;
  }

  private fireLaser(target: Enemy, enemies: readonly Enemy[]): number {
    const start = { x: this.x, y: this.y + EMITTER_Y };
    const end = this.beamEnd(target);
    const victims = enemies.filter((enemy) => this.beamIntersects(enemy, end));
    const glow = this.scene.add.line(0, 0, start.x, start.y, end.x, end.y, LaserArray.definition.color, 0.45)
      .setOrigin(0)
      .setLineWidth(BEAM_WIDTH + 8)
      .setDepth(8);
    const core = this.scene.add.line(0, 0, start.x, start.y, end.x, end.y, 0xe8f7ff, 1)
      .setOrigin(0)
      .setLineWidth(3)
      .setDepth(9);
    this.scene.tweens.add({
      targets: [glow, core], alpha: 0, duration: 150,
      onComplete: () => { glow.destroy(); core.destroy(); },
    });
    playLaserSound(this.scene);
    for (const enemy of victims) enemy.receiveHit({ damage: LASER_DAMAGE, source: this });
    return victims.length;
  }

  private beamEnd(target: Enemy): { x: number; y: number } {
    const startY = this.y + EMITTER_Y;
    const dx = target.x - this.x;
    const dy = target.y - startY;
    let extension = -startY / dy;
    const topX = this.x + dx * extension;
    if (topX < 0) extension = -this.x / dx;
    else if (topX > GAME_WIDTH) extension = (GAME_WIDTH - this.x) / dx;
    return { x: this.x + dx * extension, y: startY + dy * extension };
  }

  private beamIntersects(enemy: Enemy, end: { x: number; y: number }): boolean {
    const startY = this.y + EMITTER_Y;
    const dx = end.x - this.x;
    const dy = end.y - startY;
    const length = Math.hypot(dx, dy);
    if (length === 0) return false;
    const alongX = dx / length;
    const alongY = dy / length;
    const relativeX = enemy.x - this.x;
    const relativeY = enemy.y - startY;
    const halfWidth = enemy.displayWidth / 2;
    const halfHeight = enemy.displayHeight / 2;
    const along = relativeX * alongX + relativeY * alongY;
    const alongExtent = Math.abs(alongX) * halfWidth + Math.abs(alongY) * halfHeight;
    if (along < -alongExtent || along > length + alongExtent) return false;
    const sideways = Math.abs(relativeY * alongX - relativeX * alongY);
    const sidewaysExtent = Math.abs(alongY) * halfWidth + Math.abs(alongX) * halfHeight;
    return sideways <= BEAM_WIDTH / 2 + sidewaysExtent;
  }

  private refreshChargeDisplay(nearby: boolean): void {
    const progress = Math.min(1, this.chargeMs / this.requiredChargeMs);
    const percent = Math.floor(progress * 100);
    this.chargeFill.setScale(progress, 1).setAlpha(nearby ? 1 : 0.45);
    this.chargeFill.setFillStyle(progress === 1 ? COLORS.accent : LaserArray.definition.color);
    if (percent !== this.shownPercent) {
      this.chargeText.setText(percent === 100 ? "OK" : `${percent}%`);
      this.shownPercent = percent;
    }
    this.chargeText.setAlpha(nearby ? 1 : 0.6);
    this.emitter.setFillStyle(
      progress === 1 && nearby ? COLORS.accent : LaserArray.definition.color,
      nearby ? 0.95 : 0.2,
    );
    this.emitter.setStrokeStyle(nearby ? 3 : 2, LaserArray.definition.color, nearby ? 1 : 0.5);
  }

  private get chargeRadius(): number {
    return this.hasUpgrade("extended-coil") ? EXTENDED_RADIUS : CHARGE_RADIUS;
  }

  private get requiredChargeMs(): number {
    return CHARGE_MS * this.automaticFireRateMultiplier;
  }

  private get player(): Player {
    return this.scene.data.get(RUN_DATA.player) as Player;
  }
}
