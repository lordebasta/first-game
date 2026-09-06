import Phaser from "phaser";
import { BEST_SCORE_KEY, COLORS, GAME_WIDTH } from "../constants";
import { Player } from "../entities/Player";
import { createGameTextures } from "../graphics/createGameTextures";
import { PlayerCommandSource } from "../input/PlayerCommands";
import { CombatSystem, type ProjectileImpact } from "../systems/CombatSystem";
import { EnemySpawner } from "../systems/EnemySpawner";
import { PlayerWeapon } from "../systems/PlayerWeapon";

const PLAYER_Y = 580;
const CORE_Y = 678;

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private enemySpawner!: EnemySpawner;
  private combat!: CombatSystem;
  private core!: Phaser.GameObjects.Rectangle;
  private scoreText!: Phaser.GameObjects.Text;
  private score = 0;
  private gameEnded = false;

  constructor() {
    super("game");
  }

  create(): void {
    // Defensive reset in case a future scene pauses the shared Arcade world.
    this.physics.resume();
    createGameTextures(this);
    this.drawPlayfield();

    this.core = this.add
      .rectangle(GAME_WIDTH / 2, CORE_Y, 220, 34, COLORS.core)
      .setStrokeStyle(5, COLORS.coreGlow);

    const commands = new PlayerCommandSource(this);
    const weapon = new PlayerWeapon(this);
    this.player = new Player(this, GAME_WIDTH / 2, PLAYER_Y, commands, weapon);
    this.enemySpawner = new EnemySpawner(this);
    this.combat = new CombatSystem(this, (impact) => this.handleProjectileImpact(impact));
    this.combat.registerProjectileHits(this.player.weapon.projectiles, this.enemySpawner.group);

    this.scoreText = this.add.text(28, 24, "PUNTI  000000", {
      color: COLORS.text,
      fontFamily: "monospace",
      fontSize: "24px",
      fontStyle: "bold",
    });

    this.add
      .text(GAME_WIDTH - 28, 28, "A/D · FRECCE     SPAZIO · CLICK", {
        color: COLORS.mutedText,
        fontFamily: "monospace",
        fontSize: "15px",
      })
      .setOrigin(1, 0);

    this.enemySpawner.start(this.time.now);
  }

  update(time: number): void {
    if (this.gameEnded) {
      return;
    }

    this.player.weapon.update();
    this.enemySpawner.update(time);

    if (this.enemySpawner.hasEnemyReached(this.core.y - 18)) {
      this.endGame();
    }
  }

  private handleProjectileImpact(impact: ProjectileImpact): void {
    this.score += 100;
    this.scoreText.setText(`PUNTI  ${this.score.toString().padStart(6, "0")}`);
    this.showHitEffect(impact.position);
  }

  private showHitEffect(position: Phaser.Math.Vector2): void {
    const flash = this.add.circle(position.x, position.y, 7, COLORS.projectile, 0.9);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 3,
      duration: 160,
      onComplete: () => flash.destroy(),
    });
  }

  private endGame(): void {
    this.gameEnded = true;
    this.player.setControllable(false);
    this.cameras.main.shake(220, 0.012);
    this.core.setFillStyle(COLORS.enemy);

    const bestScore = Math.max(this.score, this.readBestScore());
    this.writeBestScore(bestScore);

    this.time.delayedCall(450, () => {
      this.scene.start("game-over", { score: this.score, bestScore });
    });
  }

  private readBestScore(): number {
    try {
      return Number.parseInt(localStorage.getItem(BEST_SCORE_KEY) ?? "0", 10) || 0;
    } catch {
      return 0;
    }
  }

  private writeBestScore(score: number): void {
    try {
      localStorage.setItem(BEST_SCORE_KEY, String(score));
    } catch {
      // The game still works when browser storage is disabled.
    }
  }

  private drawPlayfield(): void {
    this.add.rectangle(GAME_WIDTH / 2, PLAYER_Y + 48, GAME_WIDTH - 64, 2, COLORS.playerGlow);
    this.add.rectangle(GAME_WIDTH / 2, CORE_Y - 32, GAME_WIDTH - 64, 2, COLORS.coreGlow);

    for (let x = 72; x < GAME_WIDTH; x += 128) {
      this.add.circle(x, 115 + (x % 3) * 42, 1.5, 0x8fb2c9, 0.55);
    }
  }
}
