import Phaser from "phaser";
import { COLORS, GAME_HEIGHT, GAME_WIDTH } from "../constants";
import { createButton } from "../ui";

interface GameOverData {
  wave: number;
  lastLevel: number;
  victory: boolean;
}

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super("game-over");
  }

  create(data: GameOverData): void {
    const title = data.victory ? "AVAMPOSTO SALVO" : "NUCLEO DISTRUTTO";
    this.add
      .text(GAME_WIDTH / 2, 145, title, {
        color: data.victory ? "#56f29a" : "#ff5470",
        fontFamily: "monospace",
        fontSize: "48px",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(
        GAME_WIDTH / 2,
        250,
        data.victory
          ? `HAI RESISTITO A TUTTE\nLE ${data.lastLevel} ONDATE`
          : `ONDATA RAGGIUNTA\n${data.wave.toString().padStart(2, "0")} / ${data.lastLevel}`,
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
