import Phaser from "phaser";
import { COLORS, DEV_PANEL_WIDTH, GAME_HEIGHT, GAME_WIDTH } from "../constants";
import { createButton } from "../ui";

export interface DevAction {
  label: string;
  onClick: () => void;
}

interface DevToolsOptions {
  actions: readonly DevAction[];
  getDebugLines: () => readonly string[];
}

/** Development-only controls and diagnostics, kept out of gameplay scenes. */
export class DevToolsView {
  private readonly debugPanel: Phaser.GameObjects.Container;
  private readonly debugText: Phaser.GameObjects.Text;
  private frameStartedAt = 0;
  private averageFrameMs = 0;
  private averageSceneCpuMs = 0;
  private peakSceneCpuMs = 0;

  constructor(private readonly scene: Phaser.Scene, private readonly options: DevToolsOptions) {
    const panelCenterX = GAME_WIDTH + DEV_PANEL_WIDTH / 2;
    scene.add.rectangle(panelCenterX, GAME_HEIGHT / 2, DEV_PANEL_WIDTH, GAME_HEIGHT, 0x030811, 0.96);
    scene.add.rectangle(GAME_WIDTH, GAME_HEIGHT / 2, 2, GAME_HEIGHT, COLORS.playerGlow);
    scene.add
      .text(panelCenterX, 34, "DEV TOOLS", {
        color: "#4de3ff",
        fontFamily: "monospace",
        fontSize: "18px",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    options.actions.forEach((action, index) => {
      const button = createButton(scene, panelCenterX, 430 + index * 50, action.label, action.onClick);
      button.setScale(0.78);
    });

    const background = scene.add.rectangle(panelCenterX, 230, DEV_PANEL_WIDTH - 28, 280, 0x020814, 0.88).setStrokeStyle(2, COLORS.player);
    this.debugText = scene.add
      .text(GAME_WIDTH + 28, 104, "", {
        color: COLORS.text,
        fontFamily: "monospace",
        fontSize: "14px",
        lineSpacing: 5,
      })
      .setOrigin(0, 0);
    this.debugPanel = scene.add.container(0, 0, [background, this.debugText]);

    scene.events.on(Phaser.Scenes.Events.PRE_UPDATE, this.beginFrame, this);
    scene.events.on(Phaser.Scenes.Events.POST_UPDATE, this.endFrame, this);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
  }

  destroy(): void {
    this.scene.events.off(Phaser.Scenes.Events.PRE_UPDATE, this.beginFrame, this);
    this.scene.events.off(Phaser.Scenes.Events.POST_UPDATE, this.endFrame, this);
    this.debugPanel.destroy(true);
  }

  private beginFrame(_time: number, delta: number): void {
    this.frameStartedAt = performance.now();
    this.averageFrameMs = this.smoothed(this.averageFrameMs, delta);
  }

  private endFrame(): void {
    const sceneCpuMs = performance.now() - this.frameStartedAt;
    this.averageSceneCpuMs = this.smoothed(this.averageSceneCpuMs, sceneCpuMs);
    this.peakSceneCpuMs = Math.max(sceneCpuMs, this.peakSceneCpuMs * 0.995);
    this.refreshDebugText();
  }

  private refreshDebugText(): void {
    this.debugText.setText([
      ...this.options.getDebugLines(),
      "",
      `FPS  ${this.scene.game.loop.actualFps.toFixed(0)}`,
      `FRAME  ${this.averageFrameMs.toFixed(2)} ms`,
      `CPU SCENA  ${this.averageSceneCpuMs.toFixed(2)} ms`,
      `PICCO CPU  ${this.peakSceneCpuMs.toFixed(2)} ms`,
    ]);
  }

  private smoothed(current: number, sample: number): number {
    return current === 0 ? sample : current * 0.9 + sample * 0.1;
  }
}
