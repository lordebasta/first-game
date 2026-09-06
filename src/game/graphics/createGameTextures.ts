import Phaser from "phaser";
import { COLORS } from "../constants";

export function createGameTextures(scene: Phaser.Scene): void {
  if (!scene.textures.exists("player")) {
    const graphics = scene.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(COLORS.player, 1);
    graphics.fillTriangle(24, 0, 0, 34, 48, 34);
    graphics.fillStyle(COLORS.playerGlow, 1);
    graphics.fillTriangle(24, 16, 12, 34, 36, 34);
    graphics.generateTexture("player", 48, 34);
    graphics.destroy();
  }

  if (!scene.textures.exists("projectile")) {
    const graphics = scene.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(COLORS.projectile, 1);
    graphics.fillRoundedRect(0, 0, 6, 18, 3);
    graphics.generateTexture("projectile", 6, 18);
    graphics.destroy();
  }

  if (!scene.textures.exists("enemy")) {
    const graphics = scene.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(COLORS.enemy, 1);
    graphics.fillRect(6, 0, 28, 8);
    graphics.fillRect(0, 8, 40, 20);
    graphics.fillStyle(COLORS.enemyCore, 1);
    graphics.fillRect(8, 12, 8, 8);
    graphics.fillRect(24, 12, 8, 8);
    graphics.generateTexture("enemy", 40, 28);
    graphics.destroy();
  }
}
