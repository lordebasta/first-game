import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SAMPLE_RATE = 44_100;
const OUTPUT_DIRECTORY = resolve(dirname(fileURLToPath(import.meta.url)), "../src/assets/audio");

function writeWav(filename, durationSeconds, createSample) {
  const sampleCount = Math.ceil(SAMPLE_RATE * durationSeconds);
  const dataSize = sampleCount * 2;
  const wav = Buffer.alloc(44 + dataSize);

  wav.write("RIFF", 0);
  wav.writeUInt32LE(36 + dataSize, 4);
  wav.write("WAVE", 8);
  wav.write("fmt ", 12);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(SAMPLE_RATE, 24);
  wav.writeUInt32LE(SAMPLE_RATE * 2, 28);
  wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34);
  wav.write("data", 36);
  wav.writeUInt32LE(dataSize, 40);

  for (let index = 0; index < sampleCount; index += 1) {
    const time = index / SAMPLE_RATE;
    const sample = Math.max(-1, Math.min(1, createSample(time, durationSeconds)));
    wav.writeInt16LE(Math.round(sample * 32_767), 44 + index * 2);
  }

  mkdirSync(OUTPUT_DIRECTORY, { recursive: true });
  writeFileSync(resolve(OUTPUT_DIRECTORY, filename), wav);
}

writeWav("projectile.wav", 0.1, (time, duration) => {
  const progress = time / duration;
  const envelope = Math.min(1, time / 0.004) * (1 - progress) ** 2.4;
  const phase = 2 * Math.PI * (1_180 * time - 3_600 * time * time);
  return (Math.sin(phase) * 0.72 + Math.sin(phase * 2.02) * 0.2) * envelope;
});

let randomState = 0x51f15e;
let filteredNoise = 0;
let softenedNoise = 0;
writeWav("explosion.wav", 0.42, (time, duration) => {
  randomState = (Math.imul(randomState, 1_664_525) + 1_013_904_223) >>> 0;
  const noise = randomState / 0x80000000 - 1;
  const progress = time / duration;
  const smoothing = 0.11 - progress * 0.065;
  filteredNoise += smoothing * (noise - filteredNoise);
  softenedNoise += 0.16 * (filteredNoise - softenedNoise);
  const envelope = Math.min(1, time / 0.014) * (1 - progress) ** 1.8;
  const boomPhase = 2 * Math.PI * (64 * time - 36 * time * time);
  const rumble = Math.sin(boomPhase) + Math.sin(boomPhase * 0.51) * 0.28;
  const mixed = softenedNoise * 0.48 + rumble * 0.52;
  return Math.tanh(mixed * 1.12) * envelope * 0.78;
});
