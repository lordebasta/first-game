export type EnemyKind = "scout" | "scout-veteran" | "infantry";
import type { EnemyHealth } from "../entities/Enemy";

export interface WaveEnemy {
  kind: EnemyKind;
  health?: EnemyHealth;
}

export interface WaveDefinition {
  columns: number;
  rows: number;
  speedMultiplier: number;
  enemies: WaveEnemy[];
}

const scout = (): WaveEnemy => ({ kind: "scout" });
const toughScout = (): WaveEnemy => ({ kind: "scout", health: 2 });

export const WAVES: readonly WaveDefinition[] = [
  { columns: 5, rows: 1, speedMultiplier: 1, enemies: Array.from({ length: 5 }, scout) },
  { columns: 5, rows: 2, speedMultiplier: 1, enemies: Array.from({ length: 10 }, scout) },
  { columns: 5, rows: 2, speedMultiplier: 1, enemies: Array.from({ length: 10 }, (_, i) => i % 3 === 0 ? toughScout() : scout()) },
  { columns: 6, rows: 2, speedMultiplier: 1, enemies: Array.from({ length: 12 }, (_, i) => i % 2 === 0 ? toughScout() : scout()) },
  {
    columns: 5,
    rows: 3,
    speedMultiplier: 1,
    enemies: [
      toughScout(), scout(), toughScout(), scout(), toughScout(),
      toughScout(), scout(), { kind: "scout-veteran" }, scout(), toughScout(),
      toughScout(), scout(), toughScout(), scout(), toughScout(),
    ],
  },
];

export const LAST_LEVEL = WAVES.length;

export function getWaveDefinition(wave: number): WaveDefinition {
  const authoredWave = WAVES[wave - 1];
  if (authoredWave) {
    return authoredWave;
  }

  throw new Error(`Wave ${wave} has not been authored yet.`);
}
