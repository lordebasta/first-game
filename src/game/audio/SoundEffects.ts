import type Phaser from "phaser";

export const SOUND_EFFECTS = {
  laser: { key: "laser", gain: 0.3 },
  uiClick: { key: "ui-click", gain: 2 },
} as const;

const LASER_SOUND_INTERVAL_MS = 35;
const SOUND_EFFECTS_VOLUME_KEY = "sound-effects-volume";
const DEFAULT_SOUND_EFFECTS_VOLUME = 1;
const lastLaserAt = new WeakMap<Phaser.Scene, number>();
const clampVolume = (value: number): number => Math.max(0, Math.min(1, value));

export function initializeSoundEffectsVolume(scene: Phaser.Scene): void {
  if (scene.registry.get(SOUND_EFFECTS_VOLUME_KEY) === undefined) {
    scene.registry.set(SOUND_EFFECTS_VOLUME_KEY, DEFAULT_SOUND_EFFECTS_VOLUME);
  }
}

export function getSoundEffectsVolume(scene: Phaser.Scene): number {
  const value = scene.registry.get(SOUND_EFFECTS_VOLUME_KEY);
  return typeof value === "number"
    ? clampVolume(value)
    : DEFAULT_SOUND_EFFECTS_VOLUME;
}

export function setSoundEffectsVolume(scene: Phaser.Scene, value: number): void {
  scene.registry.set(SOUND_EFFECTS_VOLUME_KEY, clampVolume(value));
}

export function playLaserSound(scene: Phaser.Scene): void {
  const now = scene.time.now;
  const previous = lastLaserAt.get(scene);
  if (previous !== undefined && now - previous < LASER_SOUND_INTERVAL_MS) return;
  if (!scene.cache.audio.exists(SOUND_EFFECTS.laser.key)) return;
  lastLaserAt.set(scene, now);
  scene.sound.play(SOUND_EFFECTS.laser.key, {
    volume: SOUND_EFFECTS.laser.gain * getSoundEffectsVolume(scene),
  });
}

export function playUiClickSound(scene: Phaser.Scene): void {
  if (!scene.cache.audio.exists(SOUND_EFFECTS.uiClick.key)) return;
  scene.sound.play(SOUND_EFFECTS.uiClick.key, {
    volume: SOUND_EFFECTS.uiClick.gain * getSoundEffectsVolume(scene),
  });
}
