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
    const body = {
      reset() {},
      setSize(width, height) { this.width = width; this.height = height; return this; },
    };
    Object.assign(this, { scene: scene.add ? scene : { ...scene, add: { graphics } }, x, y, body });
  }
  enableBody(_reset, x, y) { Object.assign(this, { x, y, active: true }); }
  disableBody() { this.active = false; }
  setVelocity(x, y) { this.velocity = { x, y }; }
  setTexture(texture) { this.texture = texture; }
  setScale(x, y = x) { this.scaleX = x; this.scaleY = y; }
  setPosition(x, y) { this.x = x; this.y = y; }
  setX(x) { this.x = x; return this; }
  setY(y) { this.y = y; }
  setTint(color) { this.tint = color; }
  setAlpha(alpha) { this.alpha = alpha; }
  setDepth(depth) { this.depth = depth; return this; }
}

const phaser = {
  Physics: { Arcade: { Sprite } },
  GameObjects: { Container: class {} },
  Math: {
    Clamp: (value, min, max) => Math.max(min, Math.min(max, value)),
    Between: (min) => min,
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
const { SiegeBomberBoss } = load('src/game/entities/SiegeBomberBoss.ts');
const { Bomber } = load('src/game/entities/Bomber.ts');
const { GoldenRaider } = load('src/game/entities/GoldenRaider.ts');
const { Bomb } = load('src/game/entities/Bomb.ts');
const { Tank } = load('src/game/entities/Tank.ts');
const { WarMarshal } = load('src/game/entities/WarMarshal.ts');
const { Sapper } = load('src/game/entities/Sapper.ts');
const { SapperBoss } = load('src/game/entities/SapperBoss.ts');
const { Infantry } = load('src/game/entities/Infantry.ts');
const { Projectile } = load('src/game/entities/Projectile.ts');
const { Drone } = load('src/game/entities/Drone.ts');
const { CombatSystem } = load('src/game/systems/CombatSystem.ts');
const { EnemySpawner } = load('src/game/systems/EnemySpawner.ts');
const { OutpostCardSystem } = load('src/game/systems/OutpostCardSystem.ts');
const { StructureSlots } = load('src/game/systems/StructureSlots.ts');
const { StructureReplacementSystem } = load('src/game/systems/StructureReplacementSystem.ts');
const { Turret, TURRET_UPGRADES } = load('src/game/entities/structures/Turret.ts');
const { LaserArray, LASER_ARRAY_UPGRADES } = load('src/game/entities/structures/LaserArray.ts');
const { PowerPlant, POWER_PLANT_UPGRADES } = load('src/game/entities/structures/PowerPlant.ts');
const { DroneFactory, DRONE_FACTORY_UPGRADES } = load('src/game/entities/structures/DroneFactory.ts');
const { Radar, RADAR_UPGRADES } = load('src/game/entities/structures/Radar.ts');
const { AmmoDepot, AMMO_DEPOT_UPGRADES } = load('src/game/entities/structures/AmmoDepot.ts');
const { WAVES, LAST_LEVEL } = load('src/game/systems/WaveDefinitions.ts');
const { getSoundEffectsVolume, initializeSoundEffectsVolume } = load('src/game/audio/SoundEffects.ts');
const { RUN_DATA } = load('src/game/RunData.ts');

test('sound effects start at fifty percent volume', () => {
  const values = new Map();
  const scene = { registry: { get: (key) => values.get(key), set: (key, value) => values.set(key, value) } };
  initializeSoundEffectsVolume(scene);
  assert.equal(getSoundEffectsVolume(scene), 0.5);
});

test('every implemented structure exposes exactly three upgrades', () => {
  for (const upgrades of [
    POWER_PLANT_UPGRADES,
    DRONE_FACTORY_UPGRADES,
    TURRET_UPGRADES,
    LASER_ARRAY_UPGRADES,
    RADAR_UPGRADES,
    AMMO_DEPOT_UPGRADES,
  ]) {
    assert.equal(upgrades.length, 3);
  }
});

test('every selectable structure is unique for the current build', () => {
  for (const StructureClass of [PowerPlant, DroneFactory, Turret, LaserArray, Radar, AmmoDepot]) {
    assert.equal(StructureClass.definition.unique, true);
  }
});

test('the campaign authors twenty-five waves with progressive bomber, armored and sapper arcs', () => {
  assert.equal(LAST_LEVEL, 25);
  assert.equal(WAVES.length, 25);
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
  assert.equal(WAVES[10].enemies.filter((enemy) => enemy.kind === 'bomber').length, 1);
  assert.equal(WAVES[10].enemies.filter((enemy) => enemy.kind === 'golden-raider').length, 1);
  assert.deepEqual(WAVES.slice(11, 14).map((wave) => wave.enemies.filter((enemy) => enemy.kind === 'bomber').length), [1, 2, 2]);
  assert(WAVES.slice(11, 14).every((wave) => wave.enemies.some((enemy) => enemy.kind === 'infantry')));
  assert(WAVES.slice(11, 14).every((wave) => wave.enemies.some((enemy) => enemy.kind === 'scout')));
  assert.equal(WAVES[14].enemies.filter((enemy) => enemy.kind === 'siege-bomber-boss').length, 1);
  assert.deepEqual(WAVES.slice(15, 19).map((wave) => wave.enemies.filter((enemy) => enemy.kind === 'tank').length), [3, 4, 3, 5]);
  assert.equal(WAVES[17].enemies.filter((enemy) => enemy.kind === 'bomber').length, 1);
  assert.equal(WAVES[18].enemies.filter((enemy) => enemy.kind === 'bomber').length, 2);
  assert.equal(WAVES[19].enemies.filter((enemy) => enemy.kind === 'war-marshal').length, 1);
  assert.equal(WAVES[19].enemies.filter((enemy) => enemy.kind === 'tank').length, 4);
  assert.equal(WAVES[19].enemies.filter((enemy) => enemy.kind === 'infantry').length, 18);
  assert.equal(WAVES[19].enemies.filter((enemy) => enemy.kind === 'bomber').length, 1);
  assert.deepEqual(WAVES.slice(20, 24).map((wave) => wave.enemies.filter((enemy) => enemy.kind === 'sapper').length), [1, 2, 2, 3]);
  assert.deepEqual(WAVES.slice(20, 24).map((wave) => wave.enemies.filter((enemy) => enemy.kind === 'bomber').length), [0, 1, 2, 1]);
  assert(WAVES.slice(20, 24).every((wave) => wave.speedMultiplier <= 2.1));
  assert.equal(WAVES[24].enemies.filter((enemy) => enemy.kind === 'sapper-boss').length, 1);
  assert.equal(WAVES[24].enemies.filter((enemy) => enemy.kind === 'tank').length, 2);
});

test('sapper chooses a slot without highlighting it, pauses, then aligns and dives', () => {
  const scene = { add: { graphics, rectangle() { throw new Error('Sapper should not create a target marker'); } } };
  const sapper = new Sapper(scene);
  sapper.spawn(490, 94);
  sapper.displayHeight = 38;
  assert.equal(sapper.getHealth(), 3);
  sapper.updateMovement(0, 6_000);
  assert.equal(sapper.y, 310);
  sapper.updateMovement(6_000, 799);
  assert.equal(sapper.x, 490);
  sapper.updateMovement(6_799, 1);
  sapper.updateMovement(6_800, 300);
  assert.equal(sapper.x, 550);
  sapper.updateMovement(7_100, 1_000);
  assert.equal(sapper.y, 410);
  sapper.deactivate();
  sapper.spawn(170, 94);
  sapper.updateMovement(0, 6_000);
  sapper.updateMovement(6_000, 800);
  sapper.updateMovement(6_800, 16);
  assert.equal(sapper.x, 170);
});

test('wave-twenty-five boss is a tougher sapper that teleports before locking a lane', () => {
  const rectangles = [];
  const scene = {
    add: {
      graphics,
      rectangle(x, y, width) {
        const rectangle = {
          x, y, displayWidth: width,
          setDepth() { return this; }, setOrigin() { return this; }, setVisible() { return this; },
          setFillStyle(color) { this.fillColor = color; return this; },
          setStrokeStyle() { return this; }, setX(value) { this.x = value; return this; },
          setPosition(nextX, nextY) { this.x = nextX; this.y = nextY; return this; },
        };
        rectangles.push(rectangle);
        return rectangle;
      },
    },
  };
  const boss = new SapperBoss(scene);
  boss.spawn(360, 94);
  boss.displayHeight = 60;
  assert(boss instanceof Sapper);
  assert.equal(boss.getHealth(), 24);
  assert.equal(boss.usesFormationMovement(), false);
  boss.receiveHit({ damage: 5, source: {} });
  assert.equal(boss.getHealth(), 19);
  boss.updateMovement(0, 6_000);
  assert.equal(boss.y, 310);
  boss.updateMovement(6_000, 650);
  assert.equal(boss.x, 170);
  boss.updateMovement(6_650, 650);
  assert.equal(boss.x, 360);
  boss.updateMovement(7_300, 650);
  assert.equal(boss.x, 170);
  assert.equal(rectangles.length, 2);
  boss.updateMovement(7_950, 1_199);
  assert.equal(boss.y, 310);
  boss.updateMovement(9_149, 1);
  boss.updateMovement(9_150, 16);
  boss.updateMovement(9_166, 1_000);
  assert.equal(boss.y, 385);
});

test('the spawner creates a sapper boss and does not reuse it as a normal sapper', () => {
  const enemies = [];
  const group = { getChildren: () => enemies, add: (enemy) => enemies.push(enemy) };
  const scene = {
    add: {
      graphics,
      existing() {},
      rectangle(x, y, width) {
        return {
          x, y, displayWidth: width,
          setDepth() { return this; }, setOrigin() { return this; }, setVisible() { return this; },
          setFillStyle() { return this; }, setStrokeStyle() { return this; },
          setX(value) { this.x = value; return this; },
          setPosition(nextX, nextY) { this.x = nextX; this.y = nextY; return this; },
        };
      },
    },
    physics: { add: { group: () => group, existing() {} } },
  };
  const spawner = new EnemySpawner(scene, () => {}, () => {}, () => {});
  spawner.skipToWave(25, 0);
  assert.equal(enemies.length, 15);
  assert.equal(enemies.filter((enemy) => enemy instanceof SapperBoss && enemy.active).length, 1);
  spawner.skipToWave(21, 0);
  assert.equal(enemies.filter((enemy) => enemy instanceof SapperBoss && enemy.active).length, 0);
  assert.equal(enemies.filter((enemy) => enemy instanceof Sapper && !(enemy instanceof SapperBoss) && enemy.active).length, 1);
});

test('tanks use the extended health color system without armor', () => {
  const tank = new Tank({});
  tank.spawn(100, 100);
  assert.equal(tank.getHealth(), 8);
  assert.equal(tank.tint, 0xe8f7ff);
  tank.receiveHit({ damage: 1, source: {} });
  assert.equal(tank.getHealth(), 7);
  assert.equal(tank.tint, 0xff9f43);
  tank.receiveHit({ damage: 1, source: {} });
  assert.equal(tank.tint, 0x48d8e8);
});

test('war marshal deepens formation descents and calls reinforcements once at half health', () => {
  let calls = 0;
  const scene = {
    add: {
      graphics,
      circle: () => ({
        setStrokeStyle() { return this; }, setDepth() { return this; }, destroy() {},
      }),
      rectangle(x, y, width) {
        return {
          x, y, displayWidth: width,
          setDepth() { return this; }, setOrigin() { return this; }, setVisible() { return this; },
          setPosition(nextX, nextY) { this.x = nextX; this.y = nextY; return this; },
        };
      },
    },
    tweens: { add() {} },
  };
  const marshal = new WarMarshal(scene, () => { calls += 1; });
  marshal.spawn(360, 94);
  marshal.displayHeight = 54;
  assert.equal(marshal.formationDescentMultiplier(), 1.4);
  marshal.receiveHit({ damage: 28, source: {} });
  marshal.receiveHit({ damage: 1, source: {} });
  assert.equal(calls, 1);
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

test('wave-fifteen boss reacts to destroyed hardpoints with scout attack phases', () => {
  const teleportTweens = [];
  const scene = {
    add: {
      graphics,
      existing() {},
      rectangle(x, y, width) {
        return {
          x, y, displayWidth: width,
          setDepth() { return this; }, setOrigin() { return this; }, setVisible() { return this; },
          setAlpha(alpha) { this.alpha = alpha; return this; },
          setPosition(nextX, nextY) { this.x = nextX; this.y = nextY; return this; },
        };
      },
    },
    physics: { add: { existing() {} } },
    tweens: {
      add(config) {
        teleportTweens.push(config);
        config.onComplete?.();
      },
    },
  };
  const deployed = [];
  const group = { getChildren: () => deployed, add: (enemy) => deployed.push(enemy) };
  const boss = new SiegeBomberBoss(scene, group);
  boss.spawn(360, 94);
  boss.displayHeight = 54;
  assert.equal(boss.canBeTargetedAutomatically(), false);
  assert(boss.hardpoints.every((hardpoint) => hardpoint.scaleX === 1 && hardpoint.depth === 1));
  const initialHardpointBarWidth = boss.hardpoints[0].healthBar.displayWidth;
  boss.hardpoints[0].receiveHit({ damage: 1 });
  assert(boss.hardpoints[0].healthBar.displayWidth < initialHardpointBarWidth);
  assert.equal(boss.hardpoints[0].tint, 0xff5470);

  boss.hardpoints[0].deactivate();
  boss.updateMovement(100, 100);
  boss.updateMovement(340, 240);
  boss.updateMovement(580, 240);
  assert.equal(deployed.filter((enemy) => enemy instanceof Scout).length, 3);

  const xBeforeFrenzy = boss.x;
  boss.hardpoints[1].deactivate();
  boss.updateMovement(590, 10);
  assert.equal(boss.canBeTargetedAutomatically(), true);
  assert.notEqual(boss.x, xBeforeFrenzy);
  assert.equal(deployed.filter((enemy) => enemy instanceof Scout).length, 4);

  for (let attack = 1; attack < 16; attack += 1) {
    boss.updateMovement(590 + attack * 650, 650);
  }
  const afterFrenzy = deployed.length;
  assert.equal(deployed.filter((enemy) => enemy instanceof Scout).length, 11);
  assert.equal(deployed.filter((enemy) => enemy instanceof Bomb).length, 8);
  assert.equal(teleportTweens.length, 32);
  assert.deepEqual(teleportTweens.slice(0, 2).map((tween) => tween.alpha), [0, 1]);
  boss.updateMovement(10_640, 300);
  assert.equal(deployed.length, afterFrenzy);
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

test('persistent radar lock moves normally and leaves a mark on its previous target', () => {
  const previous = new ScoutVeteran({}), strongerLater = new ScoutVeteran({});
  previous.spawn(100, 200, { health: 4 });
  strongerLater.spawn(200, 100, { health: 3 });
  const radar = Object.create(Radar.prototype);
  radar.definition = Radar.definition;
  radar.upgradeDefinitions = RADAR_UPGRADES;
  radar.upgrades = new Set(['persistent-lock']);
  radar.markedEnemies = [];
  radar.scene = { data: { get: () => ({ getChildren: () => [previous, strongerLater] }) } };

  radar.update(0);
  assert.deepEqual(radar.markedEnemies, [previous]);
  previous.receiveHit({ damage: 1 });
  assert(previous.getHealth() < strongerLater.getHealth());
  radar.update(1);

  assert.deepEqual(radar.markedEnemies, [strongerLater, previous]);
  previous.receiveHit({ damage: 99 });
  radar.update(2);
  assert.deepEqual(radar.markedEnemies, [strongerLater]);
});

test('persistent radar lock preserves targets released by double scan', () => {
  const first = new ScoutVeteran({}), second = new ScoutVeteran({}), third = new ScoutVeteran({});
  first.spawn(100, 100, { health: 5 });
  second.spawn(200, 200, { health: 4 });
  third.spawn(300, 300, { health: 3 });
  const radar = Object.create(Radar.prototype);
  radar.definition = Radar.definition;
  radar.upgradeDefinitions = RADAR_UPGRADES;
  radar.upgrades = new Set(['double-scan', 'persistent-lock']);
  radar.markedEnemies = [];
  radar.scene = { data: { get: () => ({ getChildren: () => [first, second, third] }) } };

  radar.update(0);
  assert.deepEqual(radar.markedEnemies, [first, second]);
  first.receiveHit({ damage: 2 });
  radar.update(1);

  assert.deepEqual(radar.markedEnemies, [second, third, first]);
});

test('power grid boosts automatic structures regardless of slot distance', () => {
  const multipliers = [];
  const distantAutomaticStructure = {
    setAutomaticFireRateMultiplier(multiplier) { multipliers.push(multiplier); },
  };
  const powerPlant = Object.create(PowerPlant.prototype);
  powerPlant.definition = PowerPlant.definition;
  powerPlant.upgradeDefinitions = POWER_PLANT_UPGRADES;
  powerPlant.upgrades = new Set(['power-grid']);
  powerPlant.scene = {
    data: { get: () => ({ getStructures: () => [powerPlant, undefined, distantAutomaticStructure] }) },
  };

  powerPlant.update(0);

  assert.deepEqual(multipliers, [0.75]);
});

test('power plant force wave slows every active enemy for 2.5 seconds', () => {
  const first = new Infantry({}), second = new Bomb({});
  first.spawn(100, 100);
  second.spawn(200, 100);
  const powerPlant = Object.create(PowerPlant.prototype);
  powerPlant.definition = PowerPlant.definition;
  powerPlant.upgradeDefinitions = POWER_PLANT_UPGRADES;
  powerPlant.upgrades = new Set(['force-wave']);
  powerPlant.nextForceWaveAt = 5_000;
  powerPlant.x = 360;
  powerPlant.y = 625;
  powerPlant.scene = {
    data: { get: () => ({ getChildren: () => [first, second] }) },
    add: {
      circle: () => ({
        setStrokeStyle() { return this; }, setDepth() { return this; }, destroy() {},
      }),
    },
    tweens: { add() {} },
  };

  powerPlant.update(5_000);

  assert.equal(first.movementSpeedMultiplier(7_499), 0.5);
  assert.equal(second.movementSpeedMultiplier(7_499), 0.5);
  assert.equal(first.movementSpeedMultiplier(7_500), 1);
  assert.equal(powerPlant.nextForceWaveAt, 15_000);
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

test('bombers retain five health after extending the color palette for tanks', () => {
  const bomber = new Bomber({}, { getChildren: () => [], add() {} });
  bomber.spawn(100, 100);
  assert.equal(bomber.getHealth(), 5);
  assert.equal(bomber.tint, 0x56f29a);

  bomber.receiveHit({ damage: 1 });
  assert.equal(bomber.getHealth(), 4);
  assert.equal(bomber.tint, 0xffdc57);
  assert(WAVES.flatMap((wave) => wave.enemies)
    .filter((enemy) => enemy.kind === 'bomber')
    .every((enemy) => enemy.health === undefined || enemy.health <= 5));
});

test('golden raider grants its reward only when destroyed, not when it escapes', () => {
  let rewards = 0;
  const destroyed = new GoldenRaider({}, () => { rewards += 1; });
  destroyed.spawn(100, 136);
  destroyed.receiveHit({ damage: 3 });
  destroyed.receiveHit({ damage: 3 });
  assert.equal(rewards, 1);

  const escaped = new GoldenRaider({}, () => { rewards += 1; });
  escaped.spawn(100, 136);
  escaped.updateMovement(10_000, 10_000);
  assert.equal(escaped.active, false);
  assert.equal(rewards, 1);
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

test('drones randomize among the three enemies closest to the base', () => {
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
    assert.equal(drone.chooseTarget(enemies, false, new Set()), enemies[2]);
  } finally {
    phaser.Utils.Array.GetRandom = getRandom;
  }
});

test('drones fire lasers by default and the twin-laser upgrade triggers every second attack', () => {
  assert(DRONE_FACTORY_UPGRADES.some((upgrade) => upgrade.id === 'double-laser'));
  assert(!DRONE_FACTORY_UPGRADES.some((upgrade) => upgrade.id === 'instant-laser'));

  const beams = [];
  const scene = {
    add: {
      line(_x, _y, fromX, fromY, toX, toY) {
        const beam = {
          fromX, fromY, toX, toY,
          setOrigin() { return this; }, setLineWidth() { return this; }, destroy() {},
        };
        beams.push(beam);
        return beam;
      },
    },
    tweens: { add() {} },
    cache: { audio: { exists: () => false } },
  };
  const primary = new Infantry({}), secondary = new Infantry({});
  primary.spawn(100, 400, { health: 4 });
  secondary.spawn(200, 300, { health: 4 });
  const drone = Object.create(Drone.prototype);
  Object.assign(drone, { scene, x: 100, y: 530, target: primary, nextShotAt: 0, attackCount: 0 });

  drone.update(0, [primary, secondary], {
    doubleLaser: true,
    fireRateMultiplier: 1,
    bombHunter: false,
    reservedBombs: new Set(),
  });
  assert.equal(primary.getHealth(), 3);
  assert.equal(secondary.getHealth(), 4);
  assert.equal(beams.length, 1);

  drone.target = primary;
  drone.nextShotAt = 0;
  drone.update(0, [primary, secondary], {
    doubleLaser: true,
    fireRateMultiplier: 1,
    bombHunter: false,
    reservedBombs: new Set(),
  });
  assert.equal(primary.getHealth(), 2);
  assert.equal(secondary.getHealth(), 3);
  assert.equal(beams.length, 3);
  assert.notEqual(beams[1].toX, beams[2].toX);
});

test('bomb-hunter drones always prioritize the bomb closest to the base', () => {
  const drone = Object.create(Drone.prototype);
  const lowestEnemy = new Infantry({});
  lowestEnemy.spawn(100, 500);
  const highBomb = new Bomb({});
  highBomb.spawn(100, 120);
  const lowBomb = new Bomb({});
  lowBomb.spawn(100, 240);

  assert.equal(drone.chooseTarget([lowestEnemy, highBomb, lowBomb], true, new Set()), lowBomb);
  assert.equal(drone.chooseTarget([lowestEnemy, highBomb, lowBomb], true, new Set([lowBomb])), highBomb);
  assert.equal(drone.chooseTarget([lowestEnemy, highBomb, lowBomb], true, new Set([highBomb, lowBomb])), lowestEnemy);
  drone.x = 0;
  drone.target = lowestEnemy;
  drone.nextShotAt = 1_000;
  drone.update(0, [lowestEnemy, highBomb, lowBomb], {
    doubleLaser: false,
    fireRateMultiplier: 1,
    bombHunter: true,
    reservedBombs: new Set(),
  });
  assert.equal(drone.target, lowBomb);
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

test('turret explosive rounds trigger on every second projectile', () => {
  const fired = [];
  const enemy = new Infantry({});
  enemy.spawn(100, 100);
  const weapon = { fireFrom: (_time, _origin, _velocity, options) => fired.push(options) };
  const structure = turret();
  Object.assign(structure, {
    scene: {
      data: {
        get: (key) => key === 'enemies' ? { getChildren: () => [enemy] } : weapon,
      },
    },
    x: 100,
    y: 600,
    nextShotAt: 0,
    shotCount: 0,
    automaticFireRateMultiplier: 1,
  });
  structure.upgrades.add('explosive');

  structure.onUpdate(0);
  structure.onUpdate(700);
  structure.onUpdate(1_400);
  structure.onUpdate(2_100);

  assert.deepEqual(fired.map((options) => options.explosionRadius), [0, 80, 0, 80]);
});

function laserArray() {
  const structure = Object.create(LaserArray.prototype);
  Object.assign(structure, { x: 360, y: 625, upgrades: new Set(), chargeMs: 0, automaticFireRateMultiplier: 1 });
  return structure;
}

function laserEnemy(x, y, health) {
  return {
    x, y, displayWidth: 28, displayHeight: 24,
    health,
    getHealth() { return this.health; },
    receiveHit({ damage }) { this.health -= damage; },
  };
}

test('laser line finder keeps highest-health priority and selects the path with more hits', () => {
  const structure = laserArray();
  const isolated = laserEnemy(210, 320, 5);
  const aligned = laserEnemy(360, 320, 5);
  const behind = laserEnemy(360, 220, 2);
  const further = laserEnemy(360, 130, 1);
  const enemies = [isolated, aligned, behind, further];

  assert.equal(structure.chooseTarget(enemies), isolated);
  structure.upgrades.add('line-finder');
  assert.equal(structure.chooseTarget(enemies), aligned);
  assert.equal(structure.chooseTarget([laserEnemy(360, 320, 6), ...enemies]).getHealth(), 6);
});

test('laser deals two base damage to every enemy crossed by its beam', () => {
  const structure = laserArray();
  const first = laserEnemy(360, 320, 5);
  const second = laserEnemy(360, 220, 4);
  const third = laserEnemy(360, 130, 3);
  const outside = laserEnemy(210, 220, 4);
  const line = {
    setOrigin() { return this; }, setLineWidth() { return this; }, setDepth() { return this; }, destroy() {},
  };
  structure.scene = {
    add: { line: () => line },
    tweens: { add() {} },
  };

  assert.equal(structure.fireLaser(first, [first, second, third, outside]), 3);
  assert.deepEqual([first.health, second.health, third.health, outside.health], [3, 2, 1, 4]);
});

test('laser charge pauses outside range and recovers after a three-target hit', () => {
  const structure = laserArray();
  const player = { x: 360 };
  let shots = 0;
  structure.scene = { data: { get: (key) => key === RUN_DATA.player ? player : { getChildren: () => [] } } };
  structure.refreshChargeDisplay = () => {};
  structure.chooseTarget = () => ({});
  structure.fireLaser = () => { shots += 1; return 3; };
  structure.upgrades.add('energy-recovery');

  structure.onUpdate(0, 250);
  assert.equal(structure.chargeMs, 250);
  player.x = 470;
  structure.onUpdate(250, 2_000);
  assert.equal(structure.chargeMs, 250);
  structure.upgrades.add('extended-coil');
  structure.onUpdate(2_250, 199);
  assert.equal(shots, 0);
  structure.onUpdate(2_449, 1);
  assert.equal(shots, 1);
  assert.equal(structure.chargeMs, 157.5);
});

test('laser display shows charge percentage and dims when the player leaves', () => {
  const structure = laserArray();
  const fill = {
    setScale(value) { this.scale = value; return this; },
    setAlpha(value) { this.alpha = value; return this; },
    setFillStyle() { return this; },
  };
  const label = {
    setText(value) { this.text = value; return this; },
    setAlpha() { return this; },
  };
  const emitter = { setFillStyle() { return this; }, setStrokeStyle() { return this; } };
  Object.assign(structure, { chargeFill: fill, chargeText: label, emitter, shownPercent: -1, chargeMs: 225 });

  structure.refreshChargeDisplay(true);
  assert.equal(fill.scale, 0.5);
  assert.equal(label.text, '50%');
  structure.refreshChargeDisplay(false);
  assert.equal(fill.alpha, 0.45);
  structure.chargeMs = 450;
  structure.refreshChargeDisplay(true);
  assert.equal(label.text, 'OK');
});

test('card quotas follow free slots and never replace missing upgrades with structures', () => {
  for (let free = 0; free <= 3; free++) {
    const hand = cards(Array.from({ length: 3 }, (_, i) => i < free ? undefined : turret()));
    assert.equal(hand.length, 3);
    assert.equal(hand.filter((card) => card.description.startsWith('Torretta:')).length, 3 - free);
  }
  assert.equal(cards([undefined, undefined, structureWithoutUpgrades('radar')]).length, 2);
});

test('upgrade cards apply once to every structure of their type', () => {
  const first = turret(), second = turret();
  const { system, slots } = cardSystem([first, second, structureWithoutUpgrades('radar')]);
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

test('replacement reward preserves the original structure upgrade count', () => {
  const original = turret();
  const structures = [original, undefined, undefined];
  let installed;
  const slots = {
    getStructures: () => structures,
    getUpgradeCount: (kind) => kind === 'turret' ? 2 : 0,
    replace(slot, StructureClass) {
      installed = StructureClass;
      structures[slot] = {
        definition: StructureClass.definition,
        getUpgradeDefinitions: () => POWER_PLANT_UPGRADES,
      };
      return true;
    },
    hasUpgrade: () => false,
    applyUpgrade() {},
  };
  const replacements = new StructureReplacementSystem({}, slots, () => {});
  const choice = replacements.getStructureChoices(0).find(
    (candidate) => candidate.StructureClass === PowerPlant,
  );
  assert(choice);

  const result = replacements.replace(0, choice.StructureClass);

  assert.equal(installed, PowerPlant);
  assert.deepEqual(result, { kind: 'power-plant', upgradeChoices: 2 });
  assert.equal(replacements.getUpgradeChoices('power-plant').length, 3);
});

test('slot replacement uninstalls the previous structure before installing the next one', () => {
  const lifecycle = [];
  class PreviousStructure {
    constructor() { this.definition = PreviousStructure.definition; }
    install() { lifecycle.push('old-install'); }
    uninstall() { lifecycle.push('old-uninstall'); }
    applyUpgrade() {}
  }
  PreviousStructure.definition = { kind: 'turret', name: 'OLD', description: '', color: 0 };
  class NextStructure {
    constructor() { this.definition = NextStructure.definition; }
    install() { lifecycle.push('new-install'); }
    applyUpgrade() {}
  }
  NextStructure.definition = { kind: 'radar', name: 'NEW', description: '', color: 0, unique: true };
  const slots = Object.create(StructureSlots.prototype);
  slots.scene = {};
  slots.structures = [new PreviousStructure(), undefined, undefined];
  slots.structureUpgrades = new Map([['turret', new Set(['damage'])]]);

  assert.equal(slots.replace(0, NextStructure), true);

  assert.deepEqual(lifecycle, ['old-uninstall', 'new-install']);
  assert.equal(slots.getStructures()[0].definition.kind, 'radar');
  assert.equal(slots.getUpgradeCount('turret'), 0);
});

test('structure cards only target empty slots', () => {
  const hand = structureCards([turret(), undefined, structureWithoutUpgrades('radar')]);
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
  const physicsTargets = [];
  const scene = {
    physics: {
      add: { overlap: (_a, _b, callback) => { overlap = callback; } },
      overlapCirc: (x, y, radius) => physicsTargets
        .filter((target) => target.active && Math.hypot(target.x - x, target.y - y) <= radius)
        .map((gameObject) => ({ gameObject })),
    },
    add: {
      circle: () => ({ destroy() {} }),
      rectangle: () => ({ angle: 0, setRotation() { return this; }, destroy() {} }),
    },
    tweens: { add() {} },
  };
  const target = (x) => {
    const enemy = new Scout({});
    enemy.spawn(x, 0, { health: 4 });
    return enemy;
  };
  const direct = target(0), nearby = target(60), far = target(100), inactive = target(10);
  inactive.active = false;
  physicsTargets.push(direct, nearby, far, inactive);
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

test('destroyed bombs deal area damage to nearby tanks', () => {
  let overlap;
  const physicsTargets = [];
  const scene = {
    physics: {
      add: { overlap: (_a, _b, callback) => { overlap = callback; } },
      overlapCirc: (x, y, radius) => physicsTargets
        .filter((target) => target.active && Math.hypot(target.x - x, target.y - y) <= radius)
        .map((gameObject) => ({ gameObject })),
    },
    add: {
      circle: () => ({ destroy() {} }),
      rectangle: () => ({ angle: 0, setRotation() { return this; }, destroy() {} }),
    },
    tweens: { add() {} },
  };
  let bomb;
  let tank;
  const group = { getChildren: () => [bomb, tank] };
  scene.data = { get: () => group };
  bomb = new Bomb(scene);
  bomb.spawn(100, 100);
  tank = new Tank(scene);
  tank.spawn(160, 100);
  physicsTargets.push(bomb, tank);
  const projectile = new Projectile(scene);
  projectile.launch(100, 100, 0, { damage: 3 });
  new CombatSystem(scene, () => {}).registerProjectileHits({}, group);

  overlap(projectile, bomb);

  assert.equal(bomb.active, false);
  assert.equal(tank.getHealth(), 6);
});

test('bomb-hunter lasers add one damage against bombs without increasing normal damage', () => {
  const scene = {
    add: {
      line: () => ({ setOrigin() { return this; }, setLineWidth() { return this; }, destroy() {} }),
    },
    tweens: { add() {} },
  };
  const drone = Object.create(Drone.prototype);
  Object.assign(drone, { scene, x: 100, y: 530 });
  const bomb = new Bomb({});
  bomb.spawn(100, 100, { health: 5 });
  const infantry = new Infantry({});
  infantry.spawn(100, 100, { health: 4 });

  drone.fireLaser(bomb, true);
  drone.fireLaser(infantry, true);

  assert.equal(bomb.getHealth(), 3);
  assert.equal(bomb.active, true);
  assert.equal(infantry.getHealth(), 3);
});
