import Phaser from "phaser";
import { Enemy, type EnemyHealth } from "./Enemy";

export interface ScoutMovementDefinition {
  readonly health: EnemyHealth;
  readonly descentSpeed: number;
  readonly waveAmplitude: number;
  readonly angularFrequency: number;
}

const SCOUT_MOVEMENT: ScoutMovementDefinition = {
  health: 1,
  descentSpeed: 50,
  waveAmplitude: 28,
  angularFrequency: 0.002,
};

/**
 * A fragile independent invader. It weaves horizontally while steadily advancing
 * toward the outpost, rather than following the infantry formation.
 */
export class Scout extends Enemy {
  private spawnY = 0;
  protected centerX = 0;
  private elapsed = 0;
  private phase = 0;
  constructor(scene: Phaser.Scene, private readonly movement: ScoutMovementDefinition = SCOUT_MOVEMENT) {
    super(scene, 0, 0, { texture: "scout", health: movement.health });
  }

  protected override onSpawn(x: number, y: number): void {
    this.spawnY = y;
    this.centerX = x;
    this.elapsed = 0;
    this.phase = x * 0.035;
  }

  override usesFormationMovement(): boolean {
    return false;
  }

  override updateMovement(_time: number, delta: number): void {
    this.elapsed += delta;
    const elapsed = this.elapsed;
    const { descentSpeed, angularFrequency, waveAmplitude } = this.movement;
    const descent = (elapsed * descentSpeed) / 1_000;
    const oscillation = Math.sin(elapsed * angularFrequency + this.phase) * waveAmplitude;
    this.setPosition(this.centerX + oscillation - Math.sin(this.phase) * waveAmplitude, this.spawnY + descent);
    this.body?.reset(this.x, this.y);
  }

}
