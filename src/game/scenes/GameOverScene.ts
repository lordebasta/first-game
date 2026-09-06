import Phaser from "phaser";
import { COLORS, GAME_HEIGHT, GAME_WIDTH } from "../constants";
import { createButton } from "../ui";

interface GameOverData {
  score: number;
  bestScore: number;
}

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super("game-over");
  }

  create(data: GameOverData): void {
    this.add
      .text(GAME_WIDTH / 2, 145, "NUCLEO DISTRUTTO", {
        color: "#ff5470",
        fontFamily: "monospace",
        fontSize: "48px",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(
        GAME_WIDTH / 2,
        250,
        `PUNTEGGIO  ${data.score.toString().padStart(6, "0")}\nRECORD     ${data.bestScore
          .toString()
          .padStart(6, "0")}`,
        {
          align: "left",
          color: COLORS.text,
          fontFamily: "monospace",
          fontSize: "25px",
          lineSpacing: 12,
        },
      )
      .setOrigin(0.5);

    createButton(this, GAME_WIDTH / 2, 390, "RIPROVA", () => {
      this.scene.start("game");
    });
    createButton(this, GAME_WIDTH / 2, 470, "MENU", () => {
      this.scene.start("menu");
    });

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 70, "Invio: riprova     Esc: menu", {
        color: COLORS.mutedText,
        fontFamily: "monospace",
        fontSize: "16px",
      })
      .setOrigin(0.5);

    this.input.keyboard?.once("keydown-ENTER", () => this.scene.start("game"));
    this.input.keyboard?.once("keydown-ESC", () => this.scene.start("menu"));
  }
}
