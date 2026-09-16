import Phaser from "phaser";
import { OUTPOST_SLOT_X } from "../constants";
import { Enemy, type EnemyDefinition } from "./Enemy";

const SAPPER_DEFINITION: EnemyDefinition = { texture: "sapper", health: 3 };
const APPROACH_SPEED = 42;
const LOCK_Y = 310;
const LOCK_DELAY_MS = 800;
const ALIGN_SPEED = 220;
const DIVE_SPEED = 100;

export interface SapperProfile extends EnemyDefinition {
  lockDelayMs: number;
  diveSpeed: number;
  teleports: number;
  teleportIntervalMs: number;
}

const NORMAL_PROFILE: SapperProfile = {
  ...SAPPER_DEFINITION,
  lockDelayMs: LOCK_DELAY_MS,
  diveSpeed: DIVE_SPEED,
  teleports: 0,
  teleportIntervalMs: 0,
};

type SapperPhase = "approach" | "teleport" | "lock" | "align" | "dive";

/** Chooses a base lane, moves into it, then dives toward the core. */
export class Sapper extends Enemy {
  private phase: SapperPhase = "approach";
  private lockDelayElapsedMs = 0;
  private teleportMs = 0;
  private teleportsRemaining = 0;
  private targetX = OUTPOST_SLOT_X[1];

  constructor(scene: Phaser.Scene, private readonly profile: SapperProfile = NORMAL_PROFILE) {
    super(scene, 0, 0, profile);
  }

  protected override onSpawn(): void {
    this.phase = "approach";
    this.lockDelayElapsedMs = 0;
    this.teleportMs = 0;
    this.teleportsRemaining = this.profile.teleports;
  }

  override usesFormationMovement(): boolean {
    return false;
  }

  override updateMovement(_time: number, delta: number): void {
    if (this.phase === "approach") {
      this.setY(Math.min(LOCK_Y, this.y + APPROACH_SPEED * delta / 1_000));
      if (this.y >= LOCK_Y) {
        this.phase = this.teleportsRemaining > 0 ? "teleport" : "lock";
        this.targetX = OUTPOST_SLOT_X.reduce((closest, x) =>
          Math.abs(x - this.x) < Math.abs(closest - this.x) ? x : closest);
      }
    } else if (this.phase === "teleport") {
      this.teleportMs += delta;
      if (this.teleportMs >= this.profile.teleportIntervalMs) {
        this.teleportMs = 0;
        const destinations = OUTPOST_SLOT_X.filter((x) => x !== this.targetX);
        this.targetX = destinations[Phaser.Math.Between(0, destinations.length - 1)];
        this.setX(this.targetX).setAlpha(0.35);
        this.teleportsRemaining -= 1;
        if (this.teleportsRemaining === 0) this.phase = "lock";
      } else {
        this.setAlpha(1);
      }
    } else if (this.phase === "lock") {
      this.setAlpha(1);
      this.lockDelayElapsedMs += delta;
      if (this.lockDelayElapsedMs >= this.profile.lockDelayMs) this.phase = "align";
    } else if (this.phase === "align") {
      const distance = this.targetX - this.x;
      const step = ALIGN_SPEED * delta / 1_000;
      this.setX(this.x + Phaser.Math.Clamp(distance, -step, step));
      if (this.x === this.targetX) this.phase = "dive";
    } else {
      this.setY(this.y + this.profile.diveSpeed * delta / 1_000);
    }
    this.body?.reset(this.x, this.y);
  }
}
