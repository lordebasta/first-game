import Phaser from "phaser";
import { BEST_SCORE_KEY, COLORS, GAME_WIDTH } from "../constants";
import { Player } from "../entities/Player";
import { Bomb } from "../entities/Bomb";
import { createGameTextures } from "../graphics/createGameTextures";
import { PlayerCommandSource } from "../input/PlayerCommands";
import { CombatSystem, type ProjectileImpact } from "../systems/CombatSystem";
import { EnemySpawner } from "../systems/EnemySpawner";
import { PlayerWeapon } from "../systems/PlayerWeapon";
import { StructureSlots } from "../systems/StructureSlots";
import { STRUCTURE_CLASSES, type StructureConstructor } from "../entities/structures";
import { StructureChoiceView } from "../ui/StructureChoiceView";
import { DevToolsView } from "../ui/DevToolsView";
import { RUN_DATA } from "../RunData";

const PLAYER_Y = 580;
const CORE_Y = 678;

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private enemySpawner!: EnemySpawner;
  private combat!: CombatSystem;
  private structureSlots!: StructureSlots;
  private structureChoice?: StructureChoiceView;
  private core!: Phaser.GameObjects.Rectangle;
  private scoreText!: Phaser.GameObjects.Text;
  private score = 0;
  private gameEnded = false;
  private choosingStructure = false;

  constructor() {
    super("game");
  }

  create(): void {
    // Defensive reset in case a future scene pauses the shared Arcade world.
    this.physics.resume();
    this.data.reset();
    createGameTextures(this);
    this.drawPlayfield();

    this.core = this.add
      .rectangle(GAME_WIDTH / 2, CORE_Y, 220, 34, COLORS.core)
      .setStrokeStyle(5, COLORS.coreGlow);

    const commands = new PlayerCommandSource(this);
    const weapon = new PlayerWeapon(this);
    this.player = new Player(this, GAME_WIDTH / 2, PLAYER_Y, commands, weapon);
    this.enemySpawner = new EnemySpawner(this, (wave) => this.handleWaveCleared(wave));
    const bombs = this.physics.add.group({ classType: Bomb });
    this.combat = new CombatSystem(this, (impact) => this.handleProjectileImpact(impact));
    this.combat.registerProjectileHits(this.player.weapon.projectiles, this.enemySpawner.group);
    this.data.set({
      [RUN_DATA.player]: this.player,
      [RUN_DATA.weapon]: weapon,
      [RUN_DATA.enemies]: this.enemySpawner.group,
      [RUN_DATA.bombs]: bombs,
      [RUN_DATA.coreLineY]: CORE_Y - 18,
      [RUN_DATA.scoreMultiplier]: 1,
    });
    this.structureSlots = new StructureSlots(this);

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

    this.createDevTools();

    this.enemySpawner.start(this.time.now);
  }

  update(time: number): void {
    if (this.gameEnded || this.choosingStructure) {
      return;
    }

    this.player.weapon.update();
    this.structureSlots.update(time);
    this.enemySpawner.update(time);

    if (this.enemySpawner.hasEnemyReached(this.core.y - 18)) {
      this.endGame();
    }
  }

  private handleProjectileImpact(impact: ProjectileImpact): void {
    const scoreMultiplier = this.data.get(RUN_DATA.scoreMultiplier) as number;
    this.score += Math.round(100 * scoreMultiplier);
    this.scoreText.setText(`PUNTI  ${this.score.toString().padStart(6, "0")}`);
    this.showHitEffect(impact.position);
  }

  private handleWaveCleared(wave: number): void {
    // Frequent early choices make the upgrade loop visible in a short run.
    if (wave > 0 && wave % 2 === 0) {
      this.openStructureChoice();
    }
  }

  private openStructureChoice(): void {
    this.structureSlots.repairAll();
    this.pauseGame(true);
    this.structureChoice = new StructureChoiceView(this, {
      choices: Phaser.Utils.Array.Shuffle([...STRUCTURE_CLASSES]).slice(0, 3),
      labelForSlot: (slot) => this.structureSlots.labelFor(slot),
      onChoose: (structure, slot) => this.placeStructure(structure, slot),
      onSkip: () => this.closeStructureChoice(),
    });
  }

  private placeStructure(structure: StructureConstructor, slot: number): void {
    this.structureSlots.place(slot, structure);
    this.closeStructureChoice();
  }

  private createDevTools(): void {
    if (!import.meta.env.DEV) {
      return;
    }

    new DevToolsView(this, {
      actions: [{ label: "DEV: ELIMINA", onClick: () => this.enemySpawner.eliminateAll() }],
      getDebugLines: () => this.getDebugLines(),
    });
  }

  private getDebugLines(): string[] {
    const player = this.player.getDebugValues();
    const enemies = this.enemySpawner.getDebugValues();
    const scoreMultiplier = this.data.get(RUN_DATA.scoreMultiplier) as number;
    return [
      `RUN  punti ${this.score}  x${scoreMultiplier.toFixed(1)}`,
      `ONDATA  ${enemies.wave}  nemici ${enemies.activeEnemies}`,
      `PLAYER  x ${player.x}  vel ${player.velocityX}`,
      `MOVIMENTO  x${player.movementMultiplier.toFixed(1)}`,
    ];
  }

  private closeStructureChoice(): void {
    this.structureChoice?.destroy();
    this.structureChoice = undefined;
    this.pauseGame(false);
  }

  private pauseGame(paused: boolean): void {
    this.choosingStructure = paused;
    this.player.setControllable(!paused);
    this.enemySpawner.setSuspended(paused);
    if (paused) {
      this.physics.pause();
    } else {
      this.physics.resume();
    }
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
