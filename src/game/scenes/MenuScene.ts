import Phaser from "phaser";
import { COLORS, GAME_HEIGHT, GAME_WIDTH } from "../constants";
import { LAST_LEVEL } from "../systems/WaveDefinitions";
import { createButton, createSlider } from "../ui";
import {
  getMusicVolume,
  initializeMusicVolume,
  preloadBackgroundMusic,
  setMusicVolume,
} from "../audio/BackgroundMusic";
import { preloadSoundEffects } from "../audio/preloadSoundEffects";
import {
  getSoundEffectsVolume,
  initializeSoundEffectsVolume,
  playUiClickSound,
  setSoundEffectsVolume,
} from "../audio/SoundEffects";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("menu");
  }

  preload(): void {
    preloadBackgroundMusic(this);
    preloadSoundEffects(this);
  }

  create(): void {
    initializeMusicVolume(this);
    initializeSoundEffectsVolume(this);
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

    createButton(this, GAME_WIDTH / 2, 335, "GIOCA", () => this.startGame());
    createSlider(
      this,
      GAME_WIDTH / 2,
      475,
      "MUSICA",
      getMusicVolume(this),
      (value) => setMusicVolume(this, value),
      190,
    );
    createSlider(
      this,
      GAME_WIDTH / 2,
      570,
      "EFFETTI",
      getSoundEffectsVolume(this),
      (value) => setSoundEffectsVolume(this, value),
      190,
      () => playUiClickSound(this),
    );

    this.add
      .text(
        GAME_WIDTH / 2,
        GAME_HEIGHT - 60,
        "Movimento: A/D o frecce\nFuoco: Spazio o click sinistro",
        {
          align: "center",
          color: COLORS.mutedText,
          fontFamily: "monospace",
          fontSize: "16px",
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
