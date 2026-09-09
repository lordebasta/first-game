import Phaser from "phaser";

const CROSSFADE_MS = 5_000;
const MUSIC_VOLUME_KEY = "music-volume";
const DEFAULT_MUSIC_VOLUME = 0.5;
type FadableSound = Phaser.Sound.BaseSound & {
  readonly volume: number;
  setVolume(value: number): FadableSound;
};
const TRACKS = [
  { key: "game-loop-1", url: new URL("../../assets/audio/game-loop-1.mp3", import.meta.url).href },
  { key: "game-loop-2", url: new URL("../../assets/audio/game-loop-2.mp3", import.meta.url).href },
] as const;

export function preloadBackgroundMusic(scene: Phaser.Scene): void {
  for (const track of TRACKS) {
    if (!scene.cache.audio.exists(track.key)) scene.load.audio(track.key, track.url);
  }
}

const clampVolume = (value: number): number => Math.max(0, Math.min(1, value));

export function initializeMusicVolume(scene: Phaser.Scene): void {
  scene.sound.setVolume(1);
  if (scene.registry.get(MUSIC_VOLUME_KEY) === undefined) {
    scene.registry.set(MUSIC_VOLUME_KEY, DEFAULT_MUSIC_VOLUME);
  }
}

export function getMusicVolume(scene: Phaser.Scene): number {
  const value = scene.registry.get(MUSIC_VOLUME_KEY);
  return typeof value === "number" ? clampVolume(value) : DEFAULT_MUSIC_VOLUME;
}

export function setMusicVolume(scene: Phaser.Scene, value: number): void {
  scene.registry.set(MUSIC_VOLUME_KEY, clampVolume(value));
}

/** Plays the game playlist and overlaps adjacent tracks with a five-second crossfade. */
export class BackgroundMusic {
  private readonly sounds = new Set<FadableSound>();
  private readonly soundLevels = new Map<FadableSound, number>();
  private readonly timers = new Set<Phaser.Time.TimerEvent>();
  private readonly tweens = new Set<Phaser.Tweens.Tween>();
  private musicVolume: number;
  private stopped = false;

  constructor(private readonly scene: Phaser.Scene) {
    initializeMusicVolume(scene);
    this.musicVolume = getMusicVolume(scene);
  }

  start(): void {
    this.playTrack(0);
  }

  setVolume(value: number): void {
    setMusicVolume(this.scene, value);
    this.musicVolume = getMusicVolume(this.scene);
    this.soundLevels.forEach((level, sound) => sound.setVolume(level * this.musicVolume));
  }

  destroy(): void {
    this.stopped = true;
    this.timers.forEach((timer) => timer.destroy());
    this.tweens.forEach((tween) => tween.destroy());
    this.sounds.forEach((sound) => {
      sound.stop();
      sound.destroy();
    });
    this.timers.clear();
    this.tweens.clear();
    this.sounds.clear();
    this.soundLevels.clear();
  }

  private playTrack(index: number): void {
    if (this.stopped) return;
    const track = TRACKS[index];
    const sound = this.scene.sound.add(track.key, { volume: 0 }) as FadableSound;
    this.sounds.add(sound);
    this.soundLevels.set(sound, 0);
    sound.play();
    this.fade(sound, 0, 1, CROSSFADE_MS);

    const transitionAfterMs = Math.max(0, sound.duration * 1_000 - CROSSFADE_MS);
    const timer = this.scene.time.delayedCall(transitionAfterMs, () => {
      this.timers.delete(timer);
      if (this.stopped) return;
      this.fade(sound, this.soundLevels.get(sound) ?? 1, 0, CROSSFADE_MS, () => this.disposeSound(sound));
      this.playTrack((index + 1) % TRACKS.length);
    });
    this.timers.add(timer);
  }

  private fade(
    sound: FadableSound,
    from: number,
    to: number,
    duration: number,
    onComplete?: () => void,
  ): void {
    const level = { value: from };
    this.setSoundLevel(sound, from);
    const tween = this.scene.tweens.add({
      targets: level,
      value: to,
      duration,
      ease: "Linear",
      onUpdate: () => this.setSoundLevel(sound, level.value),
      onComplete: () => {
        this.tweens.delete(tween);
        onComplete?.();
      },
    });
    this.tweens.add(tween);
  }

  private disposeSound(sound: FadableSound): void {
    sound.stop();
    sound.destroy();
    this.sounds.delete(sound);
    this.soundLevels.delete(sound);
  }

  private setSoundLevel(sound: FadableSound, level: number): void {
    this.soundLevels.set(sound, level);
    sound.setVolume(level * this.musicVolume);
  }
}
