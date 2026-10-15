// Testing a finisher from the studio (Play at table, Local preview) or api.play plays it composed,
// as a kill would: the travel stops at the wall and the crash shows where the token hits. It never
// writes the token (no move, no hide, no defeat).
import test from "node:test";
import assert from "node:assert/strict";
import { planFinisher, playFinisher, previewFinisher } from "../scripts/finisher-play.mjs";
import { presetFinisher } from "../scripts/finisher-presets.mjs";
import { AnimaterRuntime } from "../scripts/runtime.mjs";

const GRID = 100;
const token = (name, x, y) => {
  const t = { id: name, name, document: { x, y, width: 1, height: 1 }, w: GRID, h: GRID };
  Object.defineProperty(t, "center", { get: () => ({ x: t.document.x + GRID / 2, y: t.document.y + GRID / 2 }) });
  return t;
};
// Walks the grid like landingSpot, stopping after `blockAfter` squares (a wall).
const landing = (blockAfter) => (m, d, squares) => {
  const steps = Math.min(squares, blockAfter), lead = Math.max(Math.abs(d.x), Math.abs(d.y));
  return { x: m.document.x + Math.round((d.x / lead) * steps) * GRID, y: m.document.y + Math.round((d.y / lead) * steps) * GRID };
};
// A test host: no commit, fade or wait — a test play has nothing to write with.
const testHost = (blockAfter, traces = []) => ({ gridSize: () => GRID, landing: landing(blockAfter), trace: (...t) => traces.push(t) });
const by = (recipe, id) => recipe.stages.find((s) => s.stageId === id);

test("planFinisher: a wall slam blocked after 3 squares cuts the travel and pins the crash 0.6 square past it", () => {
  const recipe = presetFinisher("wall-slam", "ws");
  const mover = token("Orc", 100, 100), attacker = token("Hero", 0, 100);
  const planned = planFinisher({ recipe, mover, attacker, target: mover, dead: true }, testHost(3));
  assert.deepEqual(planned.to, { x: 400, y: 100 });
  assert.deepEqual(planned.from, { x: 100, y: 100 });
  assert.equal(planned.moves, true);
  for (const id of ["wall-crack", "wall-dust"]) {
    assert.deepEqual(by(planned.composed, id).atPoint, { x: 150, y: 150 }, `${id} pinned to the start centre`);
    assert.ok(Math.abs(by(planned.composed, id).offsetX - 3.6) < 1e-9, `${id} offset to the wall`);
  }
  assert.equal(by(planned.composed, "landing"), undefined, "a slam has no landing");
  assert.equal(planned.context.source, attacker);
  assert.deepEqual(planned.context.targets, [mover]);
  assert.deepEqual(mover.document, { x: 100, y: 100, width: 1, height: 1 }, "planning writes nothing");
});

test("planFinisher with no wall: the landing is pinned and offset to the landing square", () => {
  const recipe = presetFinisher("wall-slam", "ws");
  const mover = token("Orc", 100, 100);
  const { composed } = planFinisher({ recipe, mover, attacker: token("Hero", 0, 100), target: mover, dead: true }, testHost(Infinity));
  assert.equal(by(composed, "wall-crack"), undefined, "no wall, no crash");
  assert.deepEqual(by(composed, "landing").atPoint, { x: 150, y: 150 });
  assert.equal(by(composed, "landing").offsetX, 6);
});

test("previewFinisher plays each target's composed recipe, onStart for the first only, and writes nothing", async () => {
  const recipe = presetFinisher("wall-slam", "ws");
  const hero = token("Hero", 0, 100), orc = token("Orc", 100, 100), gob = token("Gob", 100, 300);
  const plays = [];
  const host = { ...testHost(3), commit: () => assert.fail("a test play never writes") };
  const result = await previewFinisher(recipe, { source: hero, targets: [orc, gob], template: "t" }, host, async (composed, context, first) => {
    plays.push({ composed, context, first });
    return `played ${context.targets[0].name}`;
  });
  assert.equal(result, "played Orc");
  assert.deepEqual(plays.map((p) => [p.context.targets[0].name, p.first, p.context.source.name, p.context.template]), [["Orc", true, "Hero", "t"], ["Gob", false, "Hero", "t"]]);
  const crack = by(plays[0].composed, "wall-crack");
  assert.deepEqual(crack.atPoint, { x: 150, y: 150 });
  assert.equal(by(plays[0].composed, "landing"), undefined);
  assert.deepEqual([orc.document.x, orc.document.y, gob.document.x, gob.document.y], [100, 100, 100, 300]);
});

test("previewFinisher: no mover token or no finisher block falls back (null) to the raw play", () => {
  const play = () => assert.fail("nothing composed to play");
  const hero = token("Hero", 0, 100);
  assert.equal(previewFinisher(presetFinisher("wall-slam", "ws"), { source: hero, targets: [] }, testHost(3), play), null);
  assert.equal(previewFinisher({ id: "r", name: "R", stages: [] }, { source: hero, targets: [token("Orc", 100, 100)] }, testHost(3), play), null);
  const sourceMover = presetFinisher("wall-slam", "ws");
  sourceMover.finisher = { ...sourceMover.finisher, mover: "source" };
  assert.equal(previewFinisher(sourceMover, { targets: [token("Orc", 100, 100)] }, testHost(3), play), null, "source mover with no source token");
});

test("playFinisher still writes the landing for automation", async () => {
  const recipe = presetFinisher("wall-slam", "ws");
  const mover = token("Orc", 100, 100), commits = [];
  const host = { ...testHost(3), play: async (r) => r.stages.map((s) => ({ ...s, delay: s.delay ?? 0, duration: s.duration ?? 0 })), wait: async () => {}, fade: async () => {}, commit: async (t, data) => commits.push(data) };
  assert.equal(await playFinisher({ recipe, mover, attacker: token("Hero", 0, 100), target: mover, dead: true }, host), true);
  assert.deepEqual(commits[0], { x: 400, y: 100, fromX: 100, fromY: 100, finisher: "ws" });
});

// End to end through the real runtime, as main.mjs's playTest drives it: the fake Sequencer
// records where each effect is drawn.
test("a studio test play of wall slam draws the crash at the wall through the real runtime", async () => {
  const recipe = presetFinisher("wall-slam", "ws");
  const assets = [...new Set(recipe.stages.flatMap((s) => s.assets))];
  const drawn = [];
  const host = {
    database: { entryExists: () => true, getPathsUnder: () => assets, getAllFileEntries: (k) => [`${k}.webm`] },
    enabled: () => true, recipes: () => [], ready: () => true, canPlay: () => true, userId: () => "u", gridSize: () => GRID,
    sequence: () => {
      const effects = [];
      const chain = (calls) => new Proxy({}, { get: (_, key) => (...args) => { calls.push([key, ...args]); return chain(calls); } });
      return {
        effect: () => { const calls = []; effects.push(calls); return chain(calls); },
        sound: () => chain([]),
        play: async () => {
          for (const calls of effects) {
            const [, where, { offset }] = calls.find((c) => c[0] === "atLocation");
            const at = where.document ? where.center : where;
            drawn.push({ file: calls.find((c) => c[0] === "file")[1], x: at.x + offset.x * GRID, y: at.y + offset.y * GRID });
          }
        },
      };
    },
    endEffects: async () => {}, motion: async () => {},
  };
  const runtime = new AnimaterRuntime(host);
  runtime.refreshCatalog();
  runtime.wait = async () => true;
  const hero = token("Hero", 0, 100), orc = token("Orc", 100, 100);
  let started = 0;
  await previewFinisher(recipe, { source: hero, targets: [orc] }, testHost(3), (composed, context, first) =>
    runtime.play(composed, context, { preview: true, ...(first ? { onStart: () => started++ } : {}) }));
  assert.equal(started, 1);
  const crash = drawn.filter((d) => !(d.x === 150 && d.y === 150));
  assert.ok(crash.length >= 2, JSON.stringify(drawn));
  for (const d of crash) assert.deepEqual([Math.round(d.x), d.y], [510, 150], `${d.file} at the wall: ${JSON.stringify(d)}`);
  assert.deepEqual([orc.document.x, orc.document.y], [100, 100], "the token is never moved");
});
