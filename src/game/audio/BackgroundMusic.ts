import Phaser from "phaser";

const CROSSFADE_MS = 5_000;
const VOLUME_INITIALIZED_KEY = "audio-volume-initialized";
const DEFAULT_VOLUME = 0.5;
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

export function initializeAudioVolume(scene: Phaser.Scene): void {
  if (scene.registry.get(VOLUME_INITIALIZED_KEY)) return;
  scene.sound.setVolume(DEFAULT_VOLUME);
  scene.registry.set(VOLUME_INITIALIZED_KEY, true);
}

/** Plays the game playlist and overlaps adjacent tracks with a five-second crossfade. */
export class BackgroundMusic {
  private readonly sounds = new Set<FadableSound>();
  private readonly timers = new Set<Phaser.Time.TimerEvent>();
  private readonly tweens = new Set<Phaser.Tweens.Tween>();
  private stopped = false;

  constructor(private readonly scene: Phaser.Scene) {}

  start(): void {
    this.playTrack(0);
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
  }

  private playTrack(index: number): void {
    if (this.stopped) return;
    const track = TRACKS[index];
    const sound = this.scene.sound.add(track.key, { volume: 0 }) as FadableSound;
    this.sounds.add(sound);
    sound.play();
    this.fade(sound, 0, 1, CROSSFADE_MS);

    const transitionAfterMs = Math.max(0, sound.duration * 1_000 - CROSSFADE_MS);
    const timer = this.scene.time.delayedCall(transitionAfterMs, () => {
      this.timers.delete(timer);
      if (this.stopped) return;
      this.fade(sound, sound.volume, 0, CROSSFADE_MS, () => this.disposeSound(sound));
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
    sound.setVolume(from);
    const tween = this.scene.tweens.add({
      targets: level,
      value: to,
      duration,
      ease: "Linear",
      onUpdate: () => sound.setVolume(level.value),
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
  }
}
