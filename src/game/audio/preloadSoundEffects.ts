import type Phaser from "phaser";
import { SOUND_EFFECTS } from "./SoundEffects";

const SOUND_EFFECT_ASSETS = [
  { key: SOUND_EFFECTS.laser.key, url: new URL("../../assets/audio/laser.mp3", import.meta.url).href },
  { key: SOUND_EFFECTS.uiClick.key, url: new URL("../../assets/audio/click.mp3", import.meta.url).href },
] as const;

export function preloadSoundEffects(scene: Phaser.Scene): void {
  for (const effect of SOUND_EFFECT_ASSETS) {
    if (!scene.cache.audio.exists(effect.key)) scene.load.audio(effect.key, effect.url);
  }
}
