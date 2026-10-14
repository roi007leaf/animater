import test from "node:test";
import assert from "node:assert/strict";
import { awayFrom, landingSteps, landingSpot, displace, displaceAllowed } from "../scripts/displacement.mjs";

const G = 100, size = { w: 100, h: 100 }, from = { x: 500, y: 500 };

test("knockback points from the attacker through the target", () => {
  assert.deepEqual(awayFrom({ x: 0, y: 550 }, { x: 550, y: 550 }), { x: 1, y: 0 });
  assert.equal(awayFrom({ x: 5, y: 5 }, { x: 5, y: 5 }), null);
  assert.equal(awayFrom(null, { x: 5, y: 5 }), null);
});

test("steps are whole squares along the direction, diagonals included", () => {
  assert.deepEqual(landingSteps(from, { x: 1, y: 0 }, 3, G), [{ x: 600, y: 500 }, { x: 700, y: 500 }, { x: 800, y: 500 }]);
  assert.deepEqual(landingSteps(from, { x: Math.SQRT1_2, y: Math.SQRT1_2 }, 2, G), [{ x: 600, y: 600 }, { x: 700, y: 700 }]);
  assert.deepEqual(landingSteps(from, null, 3, G), []);
  assert.deepEqual(landingSteps(from, { x: 1, y: 0 }, 0, G), []);
});

test("a nearly straight push never repeats a square", () => {
  const steps = landingSteps(from, { x: 0.97, y: 0.24 }, 3, G);
  assert.equal(new Set(steps.map((s) => `${s.x},${s.y}`)).size, steps.length);
});

test("the landing stops before a wall", () => {
  // A wall between x=650 and x=750 (centers) blocks the second step.
  const collides = (a, b) => Math.min(a.x, b.x) < 700 && Math.max(a.x, b.x) > 700;
  assert.deepEqual(landingSpot({ from, direction: { x: 1, y: 0 }, squares: 3, grid: G, size, collides }), { x: 600, y: 500 });
});

test("the landing stays on the scene", () => {
  const bounds = { x: 0, y: 0, width: 800, height: 800 };
  assert.deepEqual(landingSpot({ from, direction: { x: 1, y: 0 }, squares: 5, grid: G, size, bounds }), { x: 700, y: 500 });
});

test("no direction or no distance lands where it stood", () => {
  assert.deepEqual(landingSpot({ from, direction: null, squares: 3, grid: G, size }), from);
  assert.deepEqual(landingSpot({ from, direction: { x: 1, y: 0 }, squares: 0, grid: G, size }), from);
});

test("a custom snap (hex or gridless) is honored", () => {
  const snap = (p) => ({ x: p.x + 1, y: p.y });
  assert.deepEqual(landingSteps(from, { x: 1, y: 0 }, 1, G, snap), [{ x: 601, y: 500 }]);
});

const token = { document: { x: 500, y: 500 } };
const fakeHost = ({ started = true, fail = false } = {}) => {
  const log = [];
  return { log,
    play: async () => { log.push("play"); return started; },
    wait: async (ms) => { log.push(`wait ${ms}`); },
    commit: async (_t, data) => { log.push(data); if (fail) throw Error("no permission"); },
    trace: (status, detail) => log.push(`${status}: ${detail}`) };
};
const job = { token, to: { x: 700, y: 500 }, hide: true, finisher: "launch", flight: 1800, recipe: {} };

test("a finisher plays, waits out the flight, then moves and hides the token in one write", async () => {
  const host = fakeHost();
  assert.equal(await displace(job, host), true);
  assert.deepEqual(host.log, ["play", "wait 1800", { x: 700, y: 500, hidden: true, fromX: 500, fromY: 500, finisher: "launch" }]);
});

test("if the animation never starts, the token is hidden where it stood, never left invisible", async () => {
  const host = fakeHost({ started: false });
  assert.equal(await displace(job, host), true);
  assert.deepEqual(host.log, ["play", { x: 500, y: 500, hidden: true, fromX: 500, fromY: 500, finisher: "launch" }]);
});

test("a refused write is traced, not thrown", async () => {
  const host = fakeHost({ fail: true });
  assert.equal(await displace(job, host), false);
  assert.match(host.log.at(-1), /Blocked: Finisher launch: no permission/);
});

test("the active GM only finishes a creature its sender owns, still visible, at 0 HP", () => {
  const ok = { isOwner: true, alreadyHidden: false, hp: 0, hidden: true, x: 1, y: 2 };
  assert.equal(displaceAllowed(ok), true);
  assert.equal(displaceAllowed({ ...ok, isOwner: false }), false);
  assert.equal(displaceAllowed({ ...ok, alreadyHidden: true }), false);
  assert.equal(displaceAllowed({ ...ok, hp: 5 }), false);
  assert.equal(displaceAllowed({ ...ok, hp: NaN }), false);
  assert.equal(displaceAllowed({ ...ok, x: NaN }), false);
  assert.equal(displaceAllowed({ ...ok, hidden: false, hp: 5 }), true, "a plain move (forced movement) needs no 0 HP");
});
