import Phaser from "phaser";

export interface PlayerCommand {
  moveAxis: -1 | 0 | 1;
  fire: boolean;
}

export class PlayerCommandSource {
  private readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private readonly keyA: Phaser.Input.Keyboard.Key;
  private readonly keyD: Phaser.Input.Keyboard.Key;
  private readonly fireKey: Phaser.Input.Keyboard.Key;

  constructor(private readonly scene: Phaser.Scene) {
    const keyboard = scene.input.keyboard;
    if (!keyboard) {
      throw new Error("Keyboard input is not available");
    }

    this.cursors = keyboard.createCursorKeys();
    this.keyA = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.fireKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  read(): PlayerCommand {
    const movingLeft = this.cursors.left.isDown || this.keyA.isDown;
    const movingRight = this.cursors.right.isDown || this.keyD.isDown;
    const rawAxis = Number(movingRight) - Number(movingLeft);
    const pointer = this.scene.input.activePointer;

    return {
      moveAxis: rawAxis as PlayerCommand["moveAxis"],
      fire: this.fireKey.isDown || (pointer.isDown && pointer.leftButtonDown()),
    };
  }
}
