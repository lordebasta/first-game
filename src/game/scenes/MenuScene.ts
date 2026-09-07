import Phaser from "phaser";
import { COLORS, GAME_HEIGHT, GAME_WIDTH } from "../constants";
import { LAST_LEVEL } from "../systems/WaveDefinitions";
import { createButton } from "../ui";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("menu");
  }

  create(): void {
    this.add
      .text(GAME_WIDTH / 2, 180, "LAST OUTPOST", {
        color: COLORS.text,
        fontFamily: "monospace",
        fontSize: "62px",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 245, `Difendi il nucleo. Resisti a ${LAST_LEVEL} ondate.`, {
        color: COLORS.mutedText,
        fontFamily: "monospace",
        fontSize: "20px",
      })
      .setOrigin(0.5);

    createButton(this, GAME_WIDTH / 2, 360, "GIOCA", () => this.startGame());

    this.add
      .text(
        GAME_WIDTH / 2,
        GAME_HEIGHT - 100,
        "Movimento: A/D o frecce\nFuoco: Spazio o click sinistro",
        {
          align: "center",
          color: COLORS.mutedText,
          fontFamily: "monospace",
          fontSize: "18px",
          lineSpacing: 8,
        },
      )
      .setOrigin(0.5);

    this.input.keyboard?.once("keydown-ENTER", () => this.startGame());
  }

  private startGame(): void {
    this.scene.start("game");
  }
}
