// Logic regressions with a minimal Phaser adapter; browser rendering is not simulated.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function graphics() {
  return {
    lineStyle() { return this; }, strokeCircle() { return this; }, lineBetween() { return this; },
    setDepth() { return this; }, setPosition() { return this; }, setVisible() { return this; }, destroy() {},
    rotation: 0,
  };
}

class Sprite {
  constructor(scene, x = 0, y = 0) {
    Object.assign(this, { scene: scene.add ? scene : { ...scene, add: { graphics } }, x, y, body: { reset() {} } });
  }
  enableBody(_reset, x, y) { Object.assign(this, { x, y, active: true }); }
  disableBody() { this.active = false; }
  setVelocity(x, y) { this.velocity = { x, y }; }
  setTexture(texture) { this.texture = texture; }
  setScale(x, y = x) { this.scaleX = x; this.scaleY = y; }
  setPosition(x, y) { this.x = x; this.y = y; }
  setX(x) { this.x = x; }
  setTint(color) { this.tint = color; }
  setAlpha(alpha) { this.alpha = alpha; }
}

const phaser = {
  Physics: { Arcade: { Sprite } },
  GameObjects: { Container: class {} },
  Math: {
    Clamp: (value, min, max) => Math.max(min, Math.min(max, value)),
    Distance: { Between: (x, y, a, b) => Math.hypot(x - a, y - b) },
    Vector2: class { constructor(x, y) { this.x = x; this.y = y; } },
  },
  Utils: { Array: { Shuffle: (array) => array, GetRandom: (array) => array[0] } },
};

const cache = new Map();
function load(relativePath) {
  const filename = path.resolve(__dirname, '..', relativePath);
  if (cache.has(filename)) return cache.get(filename).exports;
  const module = { exports: {} };
  cache.set(filename, module);
  const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  const localRequire = (id) => {
    if (id === 'phaser') return phaser;
    const resolved = path.resolve(path.dirname(filename), id);
    return load(fs.existsSync(`${resolved}.ts`) ? `${resolved}.ts` : path.join(resolved, 'index.ts'));
  };
  vm.runInThisContext(`(function(require, module, exports) {\n${output}\n})`, { filename })(localRequire, module, module.exports);
  return module.exports;
}

const { Scout } = load('src/game/entities/Scout.ts');
const { ScoutVeteran } = load('src/game/entities/ScoutVeteran.ts');
const { CarrierBoss } = load('src/game/entities/CarrierBoss.ts');
const { Infantry } = load('src/game/entities/Infantry.ts');
const { Projectile } = load('src/game/entities/Projectile.ts');
const { Drone } = load('src/game/entities/Drone.ts');
const { CombatSystem } = load('src/game/systems/CombatSystem.ts');
const { OutpostCardSystem } = load('src/game/systems/OutpostCardSystem.ts');
const { StructureSlots } = load('src/game/systems/StructureSlots.ts');
const { Turret, TURRET_UPGRADES } = load('src/game/entities/structures/Turret.ts');
const { WALL_UPGRADES } = load('src/game/entities/structures/Wall.ts');
const { PowerPlant, POWER_PLANT_UPGRADES } = load('src/game/entities/structures/PowerPlant.ts');
const { DRONE_FACTORY_UPGRADES } = load('src/game/entities/structures/DroneFactory.ts');
const { Radar, RADAR_UPGRADES } = load('src/game/entities/structures/Radar.ts');
const { AmmoDepot, AMMO_DEPOT_UPGRADES } = load('src/game/entities/structures/AmmoDepot.ts');
const { WAVES, LAST_LEVEL } = load('src/game/systems/WaveDefinitions.ts');

test('every implemented structure exposes exactly three upgrades', () => {
  for (const upgrades of [
    WALL_UPGRADES,
    POWER_PLANT_UPGRADES,
    DRONE_FACTORY_UPGRADES,
    TURRET_UPGRADES,
    RADAR_UPGRADES,
    AMMO_DEPOT_UPGRADES,
  ]) {
    assert.equal(upgrades.length, 3);
  }
});

test('the vertical slice authors ten waves and ends with the escorted carrier boss', () => {
  assert.equal(LAST_LEVEL, 10);
  assert.equal(WAVES.length, 10);
  assert.equal(WAVES[9].enemies.filter((enemy) => enemy.kind === 'carrier-boss').length, 1);
  assert.equal(WAVES[9].enemies.filter((enemy) => enemy.kind === 'infantry').length, 18);
  assert(WAVES.slice(5, 10).every((wave) => wave.enemies.some((enemy) => enemy.kind === 'infantry')));
  assert.deepEqual(WAVES.slice(5, 9).map((wave) => wave.speedMultiplier), [1.35, 1.55, 1.75, 2]);
  assert.deepEqual(WAVES.slice(5, 9).map((wave) => wave.enemies.filter((enemy) => enemy.kind === 'scout').length), [12, 12, 10, 12]);
  assert.deepEqual(WAVES.slice(5, 9).map((wave) => wave.enemies.filter((enemy) => enemy.kind === 'infantry').length), [18, 18, 30, 36]);
  assert.equal(WAVES[8].enemies.filter((enemy) => enemy.kind === 'infantry' && enemy.health === 6).length, 12);
  assert(WAVES.slice(5, 10).flatMap((wave) => wave.enemies)
    .filter((enemy) => enemy.kind === 'infantry')
    .every((enemy) => enemy.health >= 4));
  for (const wave of WAVES.slice(5, 9)) {
    const scouts = wave.enemies.filter((enemy) => enemy.kind === 'scout');
    assert.equal(scouts[0].spawnDelayMs, 0);
    assert.equal(scouts.at(-1).spawnDelayMs, 10_000);
  }
});

test('carrier boss patrols without descending and drops scouts without an active limit', () => {
  const bars = [];
  const scene = {
    add: {
      graphics,
      existing() {},
      rectangle(x, y, width) {
        const bar = {
          x, y, displayWidth: width, visible: true,
          setDepth() { return this; }, setOrigin() { return this; },
          setVisible(value) { this.visible = value; return this; },
          setPosition(nextX, nextY) { this.x = nextX; this.y = nextY; return this; },
        };
        bars.push(bar);
        return bar;
      },
    },
    physics: { add: { existing() {} } },
  };
  const deployed = [];
  const group = { getChildren: () => deployed, add: (enemy) => deployed.push(enemy) };
  const boss = new CarrierBoss(scene, group);
  boss.spawn(360, 94);
  boss.displayHeight = 44;
  boss.updateMovement(1_600, 1_600);

  assert.equal(boss.y, 94);
  assert.equal(deployed.length, 1);
  assert(deployed[0] instanceof Scout);
  assert.equal(boss.getHealth(), 60);
  assert.equal(boss.tint, 0xffdc57);
  assert.equal(deployed[0].getHealth(), 2);
  assert.equal(bars.every((bar) => bar.visible), true);

  boss.updateMovement(17_200, 15_600);
  assert.equal(deployed.length, 14);

  for (let hit = 0; hit < 45; hit += 1) boss.receiveHit({ damage: 1 });
  assert.equal(boss.tint, 0xffdc57);
});

test('radar vulnerability adds damage instead of multiplying it', () => {
  const enemy = new ScoutVeteran({});
  enemy.spawn(100, 100);
  enemy.setMarked(true);
  enemy.receiveHit({ damage: 1 });
  assert.equal(enemy.getHealth(), 2);

  enemy.spawn(100, 100);
  enemy.setMarked(true, 2);
  enemy.receiveHit({ damage: 1 });
  assert.equal(enemy.getHealth(), 1);
});

test('radar prefers the lowest enemy when health is tied', () => {
  const top = new ScoutVeteran({}), bottom = new ScoutVeteran({});
  top.spawn(100, 100);
  bottom.spawn(100, 300);
  const radar = Object.create(Radar.prototype);
  radar.definition = Radar.definition;
  radar.upgradeDefinitions = RADAR_UPGRADES;
  radar.upgrades = new Set();
  radar.markedEnemies = [];
  radar.scene = { data: { get: () => ({ getChildren: () => [top, bottom] }) } };

  radar.update(0);
  top.receiveHit({ damage: 1 });
  bottom.receiveHit({ damage: 1 });

  assert.equal(top.getHealth(), 3);
  assert.equal(bottom.getHealth(), 2);
});

test('persistent radar lock stays on its active target when another enemy becomes stronger', () => {
  const locked = new ScoutVeteran({}), strongerLater = new ScoutVeteran({});
  locked.spawn(100, 200, { health: 4 });
  strongerLater.spawn(200, 100, { health: 3 });
  const radar = Object.create(Radar.prototype);
  radar.definition = Radar.definition;
  radar.upgradeDefinitions = RADAR_UPGRADES;
  radar.upgrades = new Set(['persistent-lock']);
  radar.markedEnemies = [];
  radar.scene = { data: { get: () => ({ getChildren: () => [locked, strongerLater] }) } };

  radar.update(0);
  assert.equal(radar.markedEnemies[0], locked);
  locked.receiveHit({ damage: 1 });
  assert(locked.getHealth() < strongerLater.getHealth());
  radar.update(1);

  assert.equal(radar.markedEnemies[0], locked);
});

test('uniform spawning preserves type defaults, health colors and reuse resets', () => {
  for (const [Type, health] of [[Scout, 1], [ScoutVeteran, 4], [Infantry, 1]]) {
    const enemy = new Type({});
    enemy.spawn(100, 100);
    assert.equal(enemy.getHealth(), health);
    enemy.spawn(100, 100, { health: 2 });
    assert.equal(enemy.tint, 0xb86aff);
    enemy.receiveHit({ damage: 1 });
    assert.equal(enemy.tint, 0xff5470);
    enemy.setMarked(true);
    assert.equal(enemy.tint, 0xff5470);
    enemy.spawn(100, 100);
    assert.equal(enemy.getHealth(), health);
    assert.equal(enemy.alpha, 1);
    assert.equal(enemy.scaleX, 1);
  }
});

test('Scout and veteran keep their own descent speed and inherited oscillation', () => {
  for (const [Type, speed, amplitude] of [[Scout, 50, 28], [ScoutVeteran, 78, 22]]) {
    const enemy = new Type({});
    enemy.spawn(250, 100);
    enemy.updateMovement(1000, 1000);
    assert.equal(enemy.y, 100 + speed);
    const expectedX = 250 + (Math.sin(2 + 250 * 0.035) - Math.sin(250 * 0.035)) * amplitude;
    assert.equal(enemy.x, expectedX);
  }
});

test('drones randomize among the three best targets for the selected priority', () => {
  const drone = Object.create(Drone.prototype);
  const enemies = [
    { y: 100, getHealth: () => 4 },
    { y: 200, getHealth: () => 1 },
    { y: 300, getHealth: () => 3 },
    { y: 400, getHealth: () => 2 },
  ];
  const getRandom = phaser.Utils.Array.GetRandom;
  phaser.Utils.Array.GetRandom = (candidates) => candidates[1];
  try {
    assert.equal(drone.chooseTarget(enemies, 'lowest'), enemies[2]);
    assert.equal(drone.chooseTarget(enemies, 'strongest'), enemies[2]);
  } finally {
    phaser.Utils.Array.GetRandom = getRandom;
  }
});

test('veteran closes, teleports and reopens while continuing its descent', () => {
  const enemy = new ScoutVeteran({});
  enemy.spawn(360, 100);
  enemy.updateMovement(1890, 1890);
  assert(enemy.scaleX > 0 && enemy.scaleX < 1);
  const before = enemy.x;
  enemy.updateMovement(1980, 90);
  assert(Math.abs(enemy.x - before) >= 150);
  assert.equal(enemy.scaleX, 0);
  enemy.updateMovement(2200, 220);
  assert.equal(enemy.scaleX, 1);
  assert.equal(enemy.y, 271.6);
});

function turret() {
  const result = Object.create(Turret.prototype);
  result.definition = Turret.definition;
  result.upgradeDefinitions = TURRET_UPGRADES;
  result.upgrades = new Set();
  result.upgradeIndicators = [];
  return result;
}
function cardSystem(structures) {
  const acquired = new Map();
  const slots = {
    getStructures: () => structures,
    labelFor: (i) => `SLOT ${i}`,
    place() {},
    hasUpgrade: (kind, id) => acquired.get(kind)?.has(id) ?? false,
    applyUpgrade(kind, id) {
      const upgrades = acquired.get(kind) ?? new Set();
      upgrades.add(id);
      acquired.set(kind, upgrades);
      structures.forEach((structure) => {
        if (structure?.definition.kind === kind) structure.applyUpgrade(id);
      });
    },
  };
  return { system: new OutpostCardSystem(slots), slots };
}
function cards(structures) {
  return cardSystem(structures).system.draw();
}
function structureCards(structures) {
  return new OutpostCardSystem({ getStructures: () => structures, labelFor: (i) => `SLOT ${i}`, place() {} }).drawStructures();
}
function structureWithoutUpgrades(kind) {
  return { definition: { kind }, getUpgradeDefinitions: () => [], hasUpgrade: () => false };
}

test('card quotas follow free slots and never replace missing upgrades with structures', () => {
  for (let free = 0; free <= 3; free++) {
    const hand = cards(Array.from({ length: 3 }, (_, i) => i < free ? undefined : turret()));
    assert.equal(hand.length, 3);
    assert.equal(hand.filter((card) => card.description.startsWith('Torretta:')).length, 3 - free);
  }
  assert.equal(cards([undefined, undefined, structureWithoutUpgrades('wall')]).length, 2);
});

test('upgrade cards apply once to every structure of their type', () => {
  const first = turret(), second = turret();
  const { system, slots } = cardSystem([first, second, structureWithoutUpgrades('wall')]);
  const hand = system.draw();
  assert.equal(hand[0].kind, 'upgrade');
  hand[0].apply();
  assert(first.hasUpgrade(TURRET_UPGRADES[0].id));
  assert(second.hasUpgrade(TURRET_UPGRADES[0].id));
  assert.equal(system.draw().some((card) => card.name === TURRET_UPGRADES[0].name), false);
  for (const upgrade of TURRET_UPGRADES) slots.applyUpgrade('turret', upgrade.id);
  assert.equal(system.draw().length, 0);
});

test('structure type upgrades are inherited by structures placed later', () => {
  const created = [];
  class FakeTurret {
    constructor() {
      this.definition = FakeTurret.definition;
      this.applied = [];
      created.push(this);
    }
    install() {}
    applyUpgrade(id) { this.applied.push(id); }
  }
  FakeTurret.definition = { kind: 'turret', name: 'TORRETTA', description: '', color: 0 };

  const slots = Object.create(StructureSlots.prototype);
  slots.scene = {};
  slots.structures = [undefined, undefined, undefined];
  slots.structureUpgrades = new Map();
  slots.place(0, FakeTurret);
  slots.applyUpgrade('turret', 'damage');
  slots.place(1, FakeTurret);
  slots.place(1, FakeTurret);

  assert.deepEqual(created.map((structure) => structure.applied), [['damage'], ['damage']]);
});

test('structure cards only target empty slots', () => {
  const hand = structureCards([turret(), undefined, structureWithoutUpgrades('wall')]);
  assert.equal(hand.length, 3);
  assert(hand.every((card) => card.kind === 'structure'));
  assert(hand.every((card) => card.targets.length === 1));
  assert(hand.every((card) => card.targets[0].label === 'SLOT 1'));
  assert.equal(structureCards([turret(), turret(), turret()]).length, 0);
});

test('unique support structures disappear from cards after placement', () => {
  const powerPlant = { definition: PowerPlant.definition };
  const ammoDepot = { definition: AmmoDepot.definition };
  const names = structureCards([powerPlant, ammoDepot, undefined]).map((card) => card.name);
  assert.equal(names.includes(PowerPlant.definition.name), false);
  assert.equal(names.includes(AmmoDepot.definition.name), false);
});

test('slot placement rejects a second copy of a unique structure', () => {
  let created = 0;
  class UniqueStructure {
    constructor() { created += 1; this.definition = UniqueStructure.definition; }
    install() {}
    applyUpgrade() {}
  }
  UniqueStructure.definition = {
    kind: 'power-plant', name: 'CENTRALE', description: '', color: 0, unique: true,
  };
  const slots = Object.create(StructureSlots.prototype);
  slots.scene = {};
  slots.structures = [undefined, undefined, undefined];
  slots.structureUpgrades = new Map();

  slots.place(0, UniqueStructure);
  slots.place(1, UniqueStructure);

  assert.equal(created, 1);
  assert.equal(slots.getStructures().filter(Boolean).length, 1);
});

test('combat applies direct and area damage once, supports piercing and resets pooled shots', () => {
  let overlap;
  const scene = {
    physics: { add: { overlap: (_a, _b, callback) => { overlap = callback; } } },
    add: { circle: () => ({ destroy() {} }) },
    tweens: { add() {} },
  };
  const target = (x) => {
    const enemy = new Scout({});
    enemy.spawn(x, 0, { health: 4 });
    return enemy;
  };
  const direct = target(0), nearby = target(60), far = target(100), inactive = target(10);
  inactive.active = false;
  const projectile = new Projectile(scene);
  projectile.launch(0, 0, 0, { damage: 2, explosionRadius: 65, pierce: 1 });
  new CombatSystem(scene, () => {}).registerProjectileHits({}, { getChildren: () => [direct, nearby, far, inactive] });
  overlap(projectile, direct);
  overlap(projectile, direct);
  assert.deepEqual([direct.getHealth(), nearby.getHealth(), far.getHealth(), inactive.getHealth()], [2, 2, 4, 4]);
  assert.equal(projectile.active, true);
  overlap(projectile, far);
  assert.equal(projectile.active, false);
  projectile.launch(0, 0);
  assert.equal(projectile.damage, 1);
  assert.equal(projectile.explosionRadius, 0);
  overlap(projectile, direct);
  assert.equal(direct.getHealth(), 1);
  assert.equal(projectile.active, false);
});
