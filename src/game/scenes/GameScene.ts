import Phaser from "phaser";
import { COLORS, GAME_WIDTH } from "../constants";
import { Player } from "../entities/Player";
import { createGameTextures } from "../graphics/createGameTextures";
import { PlayerCommandSource } from "../input/PlayerCommands";
import { CombatSystem, type ProjectileImpact } from "../systems/CombatSystem";
import { EnemySpawner } from "../systems/EnemySpawner";
import { LAST_LEVEL } from "../systems/WaveDefinitions";
import { PlayerWeapon } from "../systems/PlayerWeapon";
import { StructureSlots } from "../systems/StructureSlots";
import { OutpostCardSystem } from "../systems/OutpostCardSystem";
import { StructureChoiceView } from "../ui/StructureChoiceView";
import { DevToolsView } from "../ui/DevToolsView";
import { RUN_DATA } from "../RunData";
import { BackgroundMusic } from "../audio/BackgroundMusic";
import { PauseView } from "../ui/PauseView";
import { DevStructureView } from "../ui/DevStructureView";
import { DevWaveView } from "../ui/DevWaveView";

const PLAYER_Y = 580;
const CORE_Y = 678;

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private enemySpawner!: EnemySpawner;
  private combat!: CombatSystem;
  private structureSlots!: StructureSlots;
  private outpostCards!: OutpostCardSystem;
  private structureChoice?: StructureChoiceView;
  private pauseView?: PauseView;
  private devStructureView?: DevStructureView;
  private devWaveView?: DevWaveView;
  private backgroundMusic?: BackgroundMusic;
  private core!: Phaser.GameObjects.Rectangle;
  private waveText!: Phaser.GameObjects.Text;
  private gameEnded = false;
  private gameplayPaused = false;
  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    if ((event.key !== "Escape" && event.code !== "Escape") || event.repeat) return;
    event.preventDefault();
    this.togglePauseMenu();
  };

  constructor() {
    super("game");
  }

  create(): void {
    this.gameEnded = false;
    this.gameplayPaused = false;
    this.structureChoice = undefined;
    this.pauseView = undefined;
    this.devStructureView = undefined;
    this.devWaveView = undefined;
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
    this.enemySpawner = new EnemySpawner(
      this,
      (wave) => this.handleWaveCleared(wave),
      () => this.endGame(true),
    );
    this.combat = new CombatSystem(this, (impact) => this.handleProjectileImpact(impact));
    this.combat.registerProjectileHits(this.player.weapon.projectiles, this.enemySpawner.group);
    this.data.set({
      [RUN_DATA.player]: this.player,
      [RUN_DATA.weapon]: weapon,
      [RUN_DATA.enemies]: this.enemySpawner.group,
      [RUN_DATA.coreLineY]: CORE_Y - 18,
      [RUN_DATA.lastLevel]: LAST_LEVEL,
    });
    this.structureSlots = new StructureSlots(this);
    this.outpostCards = new OutpostCardSystem(this.structureSlots);
    this.data.set(RUN_DATA.structureSlots, this.structureSlots);

    this.waveText = this.add.text(28, 24, `ONDATA  01 / ${this.lastLevel}`, {
      color: COLORS.text,
      fontFamily: "monospace",
      fontSize: "24px",
      fontStyle: "bold",
    });

    this.add
      .text(GAME_WIDTH - 28, 28, "A/D · FRECCE   SPAZIO · CLICK   ESC · PAUSA", {
        color: COLORS.mutedText,
        fontFamily: "monospace",
        fontSize: "15px",
      })
      .setOrigin(1, 0);

    this.createDevTools();
    this.backgroundMusic = new BackgroundMusic(this);
    this.backgroundMusic.start();
    window.addEventListener("keydown", this.handleKeyDown, true);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener("keydown", this.handleKeyDown, true);
      this.backgroundMusic?.destroy();
      this.backgroundMusic = undefined;
      this.pauseView?.destroy();
      this.pauseView = undefined;
      this.devStructureView?.destroy();
      this.devStructureView = undefined;
      this.devWaveView?.destroy();
      this.devWaveView = undefined;
    });

    this.enemySpawner.start(this.time.now);
  }

  update(time: number, delta: number): void {
    if (this.gameEnded || this.gameplayPaused) {
      return;
    }

    this.player.weapon.update();
    this.structureSlots.update(time);
    this.enemySpawner.update(time, delta);

    if (this.enemySpawner.hasEnemyReached(this.core.y - 18)) {
      this.endGame();
    }
  }

  private handleProjectileImpact(impact: ProjectileImpact): void {
    this.showHitEffect(impact.position);
  }

  private handleWaveCleared(wave: number): void {
    this.waveText.setText(`ONDATA  ${(wave + 1).toString().padStart(2, "0")} / ${this.lastLevel}`);
    this.openStructureChoice(wave);
  }

  private openStructureChoice(completedWave: number): void {
    this.structureSlots.repairAll();
    this.showStructureChoice(this.outpostCards.draw(completedWave % 2 === 0));
  }

  private openDevStructureChoice(): void {
    if (this.gameEnded || this.gameplayPaused) return;
    this.pauseGame(true);
    this.devStructureView = new DevStructureView(this, {
      slots: this.structureSlots,
      onClose: () => this.closeDevStructureChoice(),
    });
  }

  private openDevWaveChoice(): void {
    if (this.gameEnded || this.gameplayPaused) return;
    this.pauseGame(true);
    this.devWaveView = new DevWaveView(this, {
      lastWave: this.lastLevel,
      onChoose: (wave) => {
        this.enemySpawner.skipToWave(wave, this.time.now);
        this.waveText.setText(`ONDATA  ${wave.toString().padStart(2, "0")} / ${this.lastLevel}`);
        this.closeDevWaveChoice();
      },
      onClose: () => this.closeDevWaveChoice(),
    });
  }

  private showStructureChoice(choices: ReturnType<OutpostCardSystem["draw"]>): void {
    if (choices.length === 0) return;
    this.pauseGame(true);
    this.structureChoice = new StructureChoiceView(this, {
      choices,
      onChoose: (apply) => {
        apply();
        this.closeStructureChoice();
      },
    });
  }

  private createDevTools(): void {
    if (!import.meta.env.DEV) {
      return;
    }

    new DevToolsView(this, {
      actions: [
        { label: "DEV: ELIMINA", onClick: () => this.enemySpawner.eliminateAll() },
        { label: "DEV: STRUTTURA", onClick: () => this.openDevStructureChoice() },
        { label: "DEV: ONDATA", onClick: () => this.openDevWaveChoice() },
      ],
      getDebugLines: () => this.getDebugLines(),
    });
  }

  private getDebugLines(): string[] {
    const player = this.player.getDebugValues();
    const enemies = this.enemySpawner.getDebugValues();
    return [
      `CAMPAGNA  ondata ${enemies.wave} / ${this.lastLevel}`,
      `NEMICI  ${enemies.activeEnemies}`,
      `PLAYER  x ${player.x}  vel ${player.velocityX}`,
      `MOVIMENTO  x${player.movementMultiplier.toFixed(1)}`,
    ];
  }

  private closeStructureChoice(): void {
    this.structureChoice?.destroy();
    this.structureChoice = undefined;
    this.pauseGame(false);
  }

  private togglePauseMenu(): void {
    if (this.gameEnded || this.structureChoice) return;
    if (this.devStructureView) {
      this.closeDevStructureChoice();
      return;
    }
    if (this.devWaveView) {
      this.closeDevWaveChoice();
      return;
    }
    if (this.pauseView) {
      this.closePauseMenu();
      return;
    }
    this.pauseGame(true);
    this.pauseView = new PauseView(this, {
      onResume: () => this.closePauseMenu(),
      onMenu: () => this.scene.start("menu"),
      onMusicVolumeChange: (value) => this.backgroundMusic?.setVolume(value),
    });
  }

  private closePauseMenu(): void {
    this.pauseView?.destroy();
    this.pauseView = undefined;
    this.pauseGame(false);
  }

  private closeDevStructureChoice(): void {
    this.devStructureView?.destroy();
    this.devStructureView = undefined;
    this.pauseGame(false);
  }

  private closeDevWaveChoice(): void {
    this.devWaveView?.destroy();
    this.devWaveView = undefined;
    this.pauseGame(false);
  }

  private get lastLevel(): number {
    return this.data.get(RUN_DATA.lastLevel) as number;
  }

  private pauseGame(paused: boolean): void {
    this.gameplayPaused = paused;
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

  private endGame(victory = false): void {
    this.gameEnded = true;
    this.player.setControllable(false);
    if (victory) {
      this.core.setFillStyle(COLORS.accent);
    } else {
      this.cameras.main.shake(220, 0.012);
      this.core.setFillStyle(COLORS.enemy);
    }

    this.time.delayedCall(450, () => {
      this.scene.start("game-over", {
        wave: this.enemySpawner.getDebugValues().wave,
        lastLevel: this.lastLevel,
        victory,
      });
    });
  }

  private drawPlayfield(): void {
    for (let x = 72; x < GAME_WIDTH; x += 128) {
      this.add.circle(x, 115 + (x % 3) * 42, 1.5, 0x8fb2c9, 0.55);
    }
  }
}
