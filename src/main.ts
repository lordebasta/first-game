import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH, WINDOW_WIDTH } from "./game/constants";
import { GameOverScene } from "./game/scenes/GameOverScene";
import { GameScene } from "./game/scenes/GameScene";
import { MenuScene } from "./game/scenes/MenuScene";

new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  width: import.meta.env.DEV ? WINDOW_WIDTH : GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: "#07111f",
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [MenuScene, GameScene, GameOverScene],
});
