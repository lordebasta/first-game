import Phaser from "phaser";
import { GAME_WIDTH } from "../constants";
import { Enemy, MAX_COLOR_CODED_HEALTH, type EnemyDefinition } from "./Enemy";
import { Bomb } from "./Bomb";

const BOMBER_DEFINITION: EnemyDefinition = { texture: "bomber", health: MAX_COLOR_CODED_HEALTH };
const HORIZONTAL_SPEED = 82;
const SIDE_MARGIN = 58;
const FIRST_DROP_DELAY_MS = 1_300;
const DROP_INTERVAL_MS = 2_350;

/** Patrols horizontally at a fixed altitude and periodically releases bombs. */
export class Bomber extends Enemy {
  private direction = 1;
  private elapsed = 0;
  private nextDropAt = FIRST_DROP_DELAY_MS;

  constructor(scene: Phaser.Scene, private readonly enemyGroup: Phaser.Physics.Arcade.Group) {
    super(scene, 0, 0, BOMBER_DEFINITION);
  }

  protected override onSpawn(x: number): void {
    this.direction = x < GAME_WIDTH / 2 ? 1 : -1;
    this.elapsed = 0;
    this.nextDropAt = FIRST_DROP_DELAY_MS;
  }

  override usesFormationMovement(): boolean {
    return false;
  }

  override updateMovement(_time: number, delta: number): void {
    this.elapsed += delta;
    const nextX = this.x + this.direction * HORIZONTAL_SPEED * delta / 1_000;
    if (nextX <= SIDE_MARGIN || nextX >= GAME_WIDTH - SIDE_MARGIN) this.direction *= -1;
    this.setX(Phaser.Math.Clamp(nextX, SIDE_MARGIN, GAME_WIDTH - SIDE_MARGIN));
    this.body?.reset(this.x, this.y);
    while (this.elapsed >= this.nextDropAt) {
      this.dropBomb(this.x, this.y + this.displayHeight / 2 + 12);
      this.nextDropAt += DROP_INTERVAL_MS;
    }
  }

  private dropBomb(x: number, y: number): void {
    const reusable = this.enemyGroup.getChildren().find((object) => object instanceof Bomb && !object.active);
    const bomb = reusable instanceof Bomb ? reusable : new Bomb(this.scene);
    if (!reusable) {
      this.scene.add.existing(bomb);
      this.scene.physics.add.existing(bomb);
      this.enemyGroup.add(bomb);
    }
    bomb.spawn(x, y);
  }
}
