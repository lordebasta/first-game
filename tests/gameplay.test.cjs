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
const { Infantry } = load('src/game/entities/Infantry.ts');
const { Projectile } = load('src/game/entities/Projectile.ts');
const { CombatSystem } = load('src/game/systems/CombatSystem.ts');
const { OutpostCardSystem } = load('src/game/systems/OutpostCardSystem.ts');
const { StructureSlots } = load('src/game/systems/StructureSlots.ts');
const { Turret, TURRET_UPGRADES } = load('src/game/entities/structures/Turret.ts');
const { WALL_UPGRADES } = load('src/game/entities/structures/Wall.ts');
const { POWER_PLANT_UPGRADES } = load('src/game/entities/structures/PowerPlant.ts');
const { SHIELD_UPGRADES } = load('src/game/entities/structures/Shield.ts');
const { DRONE_FACTORY_UPGRADES } = load('src/game/entities/structures/DroneFactory.ts');
const { Radar, RADAR_UPGRADES } = load('src/game/entities/structures/Radar.ts');
const { AMMO_DEPOT_UPGRADES } = load('src/game/entities/structures/AmmoDepot.ts');

test('every implemented structure exposes exactly three upgrades', () => {
  for (const upgrades of [
    WALL_UPGRADES,
    POWER_PLANT_UPGRADES,
    SHIELD_UPGRADES,
    DRONE_FACTORY_UPGRADES,
    TURRET_UPGRADES,
    RADAR_UPGRADES,
    AMMO_DEPOT_UPGRADES,
  ]) {
    assert.equal(upgrades.length, 3);
  }
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
  assert.equal(cards([undefined, undefined, undefined]).some((card) => card.name === 'SCUDO'), false);
  assert.equal(cards([undefined, undefined, structureWithoutUpgrades('wall')]).length, 2);
});

test('upgrade cards apply once to every structure of their type', () => {
  const first = turret(), second = turret();
  const { system, slots } = cardSystem([first, second, structureWithoutUpgrades('wall')]);
  const hand = system.draw();
  assert.equal(hand[0].targets.length, 1);
  hand[0].targets[0].apply();
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
  assert.equal(hand.some((card) => card.name === 'SCUDO'), false);
  assert.equal(structureCards([turret(), turret(), turret()]).length, 0);
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
