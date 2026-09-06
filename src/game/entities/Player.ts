import Phaser from "phaser";
import { PlayerCommandSource, type PlayerCommand } from "../input/PlayerCommands";
import { PlayerWeapon } from "../systems/PlayerWeapon";

const MOVE_SPEED = 390;

export class Player extends Phaser.Physics.Arcade.Sprite {
  private controllable = true;
  private movementMultiplier = 1;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    private readonly commands: PlayerCommandSource,
    readonly weapon: PlayerWeapon,
  ) {
    super(scene, x, y, "player");

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.body?.setSize(44, 24);
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    this.update(time);
  }

  update(time: number): void {
    if (!this.controllable) {
      return;
    }

    const command = this.commands.read();
    this.applyMovement(command);

    if (command.fire) {
      this.fire(time);
    }
  }

  setControllable(value: boolean): void {
    this.controllable = value;
    if (!value) {
      this.setVelocityX(0);
    }
  }

  changeMovementMultiplier(amount: number): void {
    this.movementMultiplier += amount;
  }

  getDebugValues(): { x: number; velocityX: number; movementMultiplier: number } {
    return {
      x: Math.round(this.x),
      velocityX: Math.round(this.body?.velocity.x ?? 0),
      movementMultiplier: this.movementMultiplier,
    };
  }

  private applyMovement(command: PlayerCommand): void {
    this.setVelocityX(command.moveAxis * MOVE_SPEED * this.movementMultiplier);

    if (command.moveAxis < 0) {
      this.setFlipX(true);
    } else if (command.moveAxis > 0) {
      this.setFlipX(false);
    }
  }

  private fire(time: number): void {
    this.weapon.tryFire(time, new Phaser.Math.Vector2(this.x, this.y - 28));
  }
}
