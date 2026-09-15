import type Phaser from "phaser";

export const SOUND_EFFECTS = {
  laser: { key: "laser", gain: 0.3 },
  projectile: { key: "projectile", gain: 0.22 },
  explosion: { key: "explosion", gain: 0.48 },
  uiClick: { key: "ui-click", gain: 2 },
} as const;

const LASER_SOUND_INTERVAL_MS = 35;
const PROJECTILE_SOUND_INTERVAL_MS = 30;
const EXPLOSION_SOUND_INTERVAL_MS = 55;
const SOUND_EFFECTS_VOLUME_KEY = "sound-effects-volume";
const DEFAULT_SOUND_EFFECTS_VOLUME = 1;
const lastLaserAt = new WeakMap<Phaser.Scene, number>();
const lastProjectileAt = new WeakMap<Phaser.Scene, number>();
const lastExplosionAt = new WeakMap<Phaser.Scene, number>();
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
  playThrottledSound(scene, SOUND_EFFECTS.laser, LASER_SOUND_INTERVAL_MS, lastLaserAt);
}

export function playProjectileSound(scene: Phaser.Scene): void {
  playThrottledSound(scene, SOUND_EFFECTS.projectile, PROJECTILE_SOUND_INTERVAL_MS, lastProjectileAt);
}

export function playExplosionSound(scene: Phaser.Scene, intensity = 1): void {
  playThrottledSound(
    scene,
    { ...SOUND_EFFECTS.explosion, gain: SOUND_EFFECTS.explosion.gain * clampVolume(intensity) },
    EXPLOSION_SOUND_INTERVAL_MS,
    lastExplosionAt,
  );
}

export function playUiClickSound(scene: Phaser.Scene): void {
  playSound(scene, SOUND_EFFECTS.uiClick);
}

function playThrottledSound(
  scene: Phaser.Scene,
  effect: { key: string; gain: number },
  interval: number,
  lastPlayedAt: WeakMap<Phaser.Scene, number>,
): void {
  if (!scene.cache?.audio?.exists(effect.key) || !scene.sound) return;
  const now = scene.time?.now ?? performance.now();
  const previous = lastPlayedAt.get(scene);
  if (previous !== undefined && now - previous < interval) return;
  lastPlayedAt.set(scene, now);
  playSound(scene, effect);
}

function playSound(scene: Phaser.Scene, effect: { key: string; gain: number }): void {
  if (!scene.cache?.audio?.exists(effect.key) || !scene.sound) return;
  scene.sound.play(effect.key, {
    volume: effect.gain * getSoundEffectsVolume(scene),
  });
}
