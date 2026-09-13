import Phaser from "phaser";
import { GAME_WIDTH } from "../constants";
import type { Hit } from "../combat/Hit";
import { Enemy, type EnemyDefinition } from "./Enemy";

const GOLDEN_RAIDER_DEFINITION: EnemyDefinition = {
  texture: "golden-raider",
  health: 3,
  usesHealthColors: false,
};
const GOLD_COLOR = 0xffd84d;
const HORIZONTAL_SPEED = 145;
const FLIGHT_AMPLITUDE = 20;
const FLIGHT_FREQUENCY = 0.006;
const START_X = -28;
const EXIT_X = GAME_WIDTH + 28;

/** A one-pass bonus target. Only its destruction grants the replacement reward. */
export class GoldenRaider extends Enemy {
  private elapsed = 0;
  private flightY = 0;
  private rewardGranted = false;

  constructor(scene: Phaser.Scene, private readonly onDestroyed: () => void) {
    super(scene, 0, 0, GOLDEN_RAIDER_DEFINITION);
  }

  protected override onSpawn(_x: number, y: number): void {
    this.elapsed = 0;
    this.flightY = y;
    this.rewardGranted = false;
    this.setPosition(START_X, y);
    this.body?.reset(this.x, this.y);
    this.setTint(GOLD_COLOR);
  }

  override usesFormationMovement(): boolean {
    return false;
  }

  override updateMovement(_time: number, delta: number): void {
    this.elapsed += delta;
    const x = START_X + HORIZONTAL_SPEED * this.elapsed / 1_000;
    const y = this.flightY + Math.sin(this.elapsed * FLIGHT_FREQUENCY) * FLIGHT_AMPLITUDE;
    this.setPosition(x, y);
    this.body?.reset(x, y);
    if (x >= EXIT_X) this.deactivate();
  }

  override receiveHit(hit: Hit): void {
    const wasActive = this.active;
    super.receiveHit(hit);
    if (wasActive && !this.active && !this.rewardGranted) {
      this.rewardGranted = true;
      this.onDestroyed();
    }
  }
}
