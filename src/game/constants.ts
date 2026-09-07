export const GAME_WIDTH = 720;
export const GAME_HEIGHT = 720;
export const DEV_PANEL_WIDTH = 240;
export const WINDOW_WIDTH = GAME_WIDTH + DEV_PANEL_WIDTH;

export const COLORS = {
  background: 0x07111f,
  panel: 0x10233d,
  text: "#e8f7ff",
  mutedText: "#8fb2c9",
  player: 0x4de3ff,
  playerGlow: 0x17677f,
  projectile: 0xfff29a,
  enemy: 0xff5470,
  enemyCore: 0x7b1731,
  outpost: 0x57728d,
  core: 0xffc857,
  coreGlow: 0x7a4e08,
  accent: 0x56f29a,
} as const;
