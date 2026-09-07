import Phaser from "phaser";
import { Scout, type ScoutMovementDefinition } from "./Scout";
import { GAME_WIDTH } from "../constants";

const VETERAN_MOVEMENT: ScoutMovementDefinition = {
  health: 4,
  descentSpeed: 78,
  waveAmplitude: 22,
  angularFrequency: 0.002,
};
const TELEPORT_INTERVAL_MS = 1800;
const CLOSE_DURATION_MS = 180;
const OPEN_DURATION_MS = 220;
const TELEPORT_MIN_DISTANCE = 150;

/** Tougher visual variant of Scout used as the wave-five mini-boss. */
export class ScoutVeteran extends Scout {
  private teleportElapsed = 0;
  private relocated = false;
  constructor(scene: Phaser.Scene) {
    super(scene, VETERAN_MOVEMENT);
    this.setTexture("scout-veteran");
  }

  protected override onSpawn(x: number, y: number): void {
    super.onSpawn(x, y);
    this.teleportElapsed = 0;
    this.relocated = false;
  }

  override updateMovement(time: number, delta: number): void {
    super.updateMovement(time, delta);
    this.teleportElapsed += delta;
    // A short squeeze, then reopen at the destination; descent never pauses.
    const animationTime = this.teleportElapsed - TELEPORT_INTERVAL_MS;
    if (animationTime < 0) return;
    if (animationTime < CLOSE_DURATION_MS) {
      this.setScale(Math.cos((animationTime / CLOSE_DURATION_MS) * Math.PI / 2), 1);
      return;
    }
    if (!this.relocated) {
      const destinations = [110, 270, 450, GAME_WIDTH - 110].filter((x) => Math.abs(x - this.x) >= TELEPORT_MIN_DISTANCE);
      this.teleportToX(Phaser.Utils.Array.GetRandom(destinations));
      this.relocated = true;
    }
    this.setScale(Math.sin(Math.min(1, (animationTime - CLOSE_DURATION_MS) / OPEN_DURATION_MS) * Math.PI / 2), 1);
    if (animationTime >= CLOSE_DURATION_MS + OPEN_DURATION_MS) {
      this.setScale(1);
      this.teleportElapsed = 0;
      this.relocated = false;
    }
  }

  private teleportToX(x: number): void {
    const offset = this.x - this.centerX;
    this.centerX = Phaser.Math.Clamp(x - offset, 70, GAME_WIDTH - 70);
    this.setX(this.centerX + offset);
    this.body?.reset(this.x, this.y);
  }
}
