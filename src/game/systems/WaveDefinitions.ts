export type EnemyKind = "scout" | "scout-veteran" | "infantry" | "carrier-boss";
import type { EnemyHealth } from "../entities/Enemy";

export interface WaveEnemy {
  kind: EnemyKind;
  health?: EnemyHealth;
  spawnDelayMs?: number;
  column?: number;
  row?: number;
}

export interface WaveDefinition {
  columns: number;
  rows: number;
  speedMultiplier: number;
  enemies: WaveEnemy[];
}

const scout = (): WaveEnemy => ({ kind: "scout" });
const toughScout = (): WaveEnemy => ({ kind: "scout", health: 2 });
const infantry = (health: EnemyHealth = 4): WaveEnemy => ({ kind: "infantry", health });
const staggerOverTenSeconds = (enemies: WaveEnemy[]): WaveEnemy[] => enemies.map((enemy, index) => ({
  ...enemy,
  spawnDelayMs: enemies.length <= 1 ? 0 : index * 10_000 / (enemies.length - 1),
}));

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
  {
    columns: 6,
    rows: 5,
    speedMultiplier: 1.35,
    enemies: [
      ...staggerOverTenSeconds([
        scout(), scout(), toughScout(), toughScout(), scout(), scout(),
        scout(), toughScout(), scout(), scout(), toughScout(), scout(),
      ]),
      ...Array.from({ length: 18 }, () => infantry()),
    ],
  },
  {
    columns: 6,
    rows: 5,
    speedMultiplier: 1.55,
    enemies: [
      ...staggerOverTenSeconds([
        toughScout(), scout(), toughScout(), scout(), toughScout(), scout(),
        scout(), toughScout(), scout(), toughScout(), scout(), toughScout(),
      ]),
      ...Array.from({ length: 18 }, (_, index) => index % 6 === 1 || index % 6 === 4 ? infantry(5) : infantry()),
    ],
  },
  {
    columns: 5,
    rows: 8,
    speedMultiplier: 1.75,
    enemies: [
      ...staggerOverTenSeconds([
        scout(), toughScout(), scout(), toughScout(), scout(),
        toughScout(), scout(), toughScout(), scout(), toughScout(),
      ]),
      ...Array.from({ length: 30 }, (_, index) => [1, 2, 3, 7].includes(index % 10) ? infantry(5) : infantry()),
    ],
  },
  {
    columns: 6,
    rows: 8,
    speedMultiplier: 2,
    enemies: [
      ...staggerOverTenSeconds([
        toughScout(), scout(), toughScout(), scout(), toughScout(), scout(),
        scout(), toughScout(), scout(), toughScout(), scout(), toughScout(),
      ]),
      ...Array.from({ length: 36 }, (_, index) => {
        const column = index % 6;
        if (column === 2 || column === 3) return infantry(6);
        return column === 0 || column === 5 ? infantry(5) : infantry();
      }),
    ],
  },
  {
    columns: 6,
    rows: 3,
    speedMultiplier: 2,
    enemies: [
      { kind: "carrier-boss", column: 2.5, row: 0 },
      ...Array.from({ length: 12 }, (_, index) => ({
        ...infantry(),
        column: index % 6,
        row: 1 + Math.floor(index / 6),
      })),
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
