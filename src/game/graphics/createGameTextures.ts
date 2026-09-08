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
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRoundedRect(0, 0, 6, 18, 3);
    graphics.generateTexture("projectile", 6, 18);
    graphics.destroy();
  }

  if (!scene.textures.exists("enemy")) {
    const graphics = scene.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(6, 0, 28, 8);
    graphics.fillRect(0, 8, 40, 20);
    graphics.fillStyle(0x555555, 1);
    graphics.fillRect(8, 12, 8, 8);
    graphics.fillRect(24, 12, 8, 8);
    graphics.generateTexture("enemy", 40, 28);
    graphics.destroy();
  }

  if (!scene.textures.exists("scout")) {
    const graphics = scene.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0xffffff, 1);
    graphics.fillTriangle(18, 0, 0, 26, 36, 26);
    graphics.fillStyle(0x555555, 1);
    graphics.fillCircle(18, 15, 5);
    graphics.generateTexture("scout", 36, 26);
    graphics.destroy();
  }

  if (!scene.textures.exists("scout-veteran")) {
    const graphics = scene.make.graphics({ x: 0, y: 0 });
    graphics.lineStyle(3, 0xffffff, 1);
    graphics.strokeTriangle(18, 1, 1, 25, 35, 25);
    graphics.fillStyle(0x999999, 1);
    graphics.fillTriangle(18, 4, 5, 23, 31, 23);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(18, 16, 5);
    graphics.generateTexture("scout-veteran", 36, 26);
    graphics.destroy();
  }

  if (!scene.textures.exists("carrier-boss")) {
    const graphics = scene.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRoundedRect(8, 8, 96, 30, 10);
    graphics.fillTriangle(0, 22, 22, 2, 22, 42);
    graphics.fillTriangle(112, 22, 90, 2, 90, 42);
    graphics.fillStyle(0x555555, 1);
    graphics.fillCircle(38, 23, 7);
    graphics.fillCircle(74, 23, 7);
    graphics.generateTexture("carrier-boss", 112, 44);
    graphics.destroy();
  }
}
