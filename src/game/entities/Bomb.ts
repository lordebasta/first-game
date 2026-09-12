import Phaser from "phaser";
import type { Hit } from "../combat/Hit";
import { showExplosion } from "../graphics/showExplosion";
import { Enemy, type EnemyDefinition } from "./Enemy";

const BOMB_SPEED = 112;
const BOMB_DEFINITION: EnemyDefinition = { texture: "bomb", health: 3 };

/** A straight-falling priority target. Structures cannot absorb it. */
export class Bomb extends Enemy {
  private elapsed = 0;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, BOMB_DEFINITION);
  }

  protected override onSpawn(): void {
    this.elapsed = 0;
    this.setTint(0xffdc57);
  }

  override usesFormationMovement(): boolean {
    return false;
  }

  override updateMovement(_time: number, delta: number): void {
    this.elapsed += delta;
    this.setY(this.y + BOMB_SPEED * delta / 1_000);
    this.setRotation(Math.sin(this.elapsed * 0.009) * 0.16);
    const pulse = 1 + Math.sin(this.elapsed * 0.014) * 0.08;
    this.setScale(1.5 * pulse, pulse);
    this.body?.reset(this.x, this.y);
  }

  override receiveHit(hit: Hit): void {
    const wasActive = this.active;
    super.receiveHit(hit);
    if (wasActive && !this.active) showExplosion(this.scene, this.x, this.y, 52);
  }
}
