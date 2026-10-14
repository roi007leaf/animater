import test from 'node:test';
import assert from 'node:assert/strict';
import { MOTIONS, validateRecipe } from '../scripts/model.mjs';
import { motionPose, combineMotionPoses, poseTransform, TokenMotionPlayer, heldPose, HOLD_LIMIT_MS, HOLD_RELEASE_MS } from '../scripts/motion.mjs';
import { GENERATED_MOTION_DURATION } from '../scripts/motion-pacing.mjs';

const NEW = ['press', 'sink', 'flicker', 'throw', 'brace', 'stagger', 'cower', 'slam', 'drift'];
const stage = motion => ({ kind: 'motion', motion, duration: 1000, distance: 0.35, intensity: 1 });

test('new gestures are registered, paced and settle exactly at rest', () => {
  for (const motion of NEW) {
    assert.ok(MOTIONS[motion], motion);
    assert.ok(GENERATED_MOTION_DURATION[motion] > 0, motion);
    for (const p of [0, 1]) assert.deepEqual(motionPose(stage(motion), p, { x: 1, y: 0 }, 100), { x: 0, y: 0, rotation: 0, scale: 1 }, motion);
    const mid = motionPose(stage(motion), 0.5, { x: 1, y: 0 }, 100);
    const moved = Math.abs(mid.x) + Math.abs(mid.y) + Math.abs(mid.rotation) + Math.abs(1 - mid.scale) + Math.abs(1 - (mid.scaleX ?? 1)) + Math.abs(1 - (mid.scaleY ?? 1)) + Math.abs(1 - (mid.alpha ?? 1));
    assert.ok(moved > 0.01, `${motion} visibly animates`);
  }
});
test('gesture semantics: press squashes down, sink fades, brace and stagger move away from the other token, throw winds up then reaches', () => {
  const press = motionPose(stage('press'), 0.5, { x: 1, y: 0 }, 100);
  assert.ok(press.y > 0 && press.scaleY < 1 && press.scaleX > 1);
  const sink = motionPose(stage('sink'), 0.5, { x: 1, y: 0 }, 100);
  assert.ok(sink.y > 0 && sink.alpha < 1);
  assert.ok(motionPose(stage('brace'), 0.5, { x: 1, y: 0 }, 100).x < 0);
  assert.ok(motionPose(stage('stagger'), 0.5, { x: 1, y: 0 }, 100).x < 0);
  assert.ok(motionPose(stage('throw'), 0.15, { x: 1, y: 0 }, 100).x < 0);
  assert.ok(motionPose(stage('throw'), 0.7, { x: 1, y: 0 }, 100).x > 0);
  assert.ok(motionPose(stage('slam'), 0.5, { x: 1, y: 0 }, 100).y < 0, 'slam rises before falling');
});
test('optional channels combine multiplicatively and legacy poses keep their shape', () => {
  assert.deepEqual(combineMotionPoses([{ x: 1, y: 0, rotation: 0, scale: 1 }]), { x: 1, y: 0, rotation: 0, scale: 1 });
  const c = combineMotionPoses([{ x: 0, y: 0, rotation: 0, scale: 1, alpha: 0.5 }, { x: 0, y: 0, rotation: 0, scale: 1, alpha: 0.5, scaleY: 0.8 }]);
  assert.equal(c.alpha, 0.25); assert.equal(c.scaleY, 0.8); assert.equal(c.scaleX, undefined);
  assert.equal(poseTransform({ x: 1, y: 2, rotation: 0, scale: 2, scaleY: 0.5 }), 'translate(1px,2px) rotate(0rad) scale(2,1)');
  assert.equal(poseTransform({ x: 0, y: 0, rotation: 0, scale: 1.2 }), 'translate(0px,0px) rotate(0rad) scale(1.2)');
});
test('canvas player applies squash and opacity and restores the token afterwards', async () => {
  let t = 0, queued;
  const player = new TokenMotionPlayer({ frame: cb => (queued = cb, 1), cancel: () => {}, now: () => t, grid: () => 100 });
  const mesh = { position: { x: 10, y: 20, set(x, y) { this.x = x; this.y = y; } }, rotation: 0, alpha: 1, scale: { x: 1, y: 1, set(x, y) { this.x = x; this.y = y; } } };
  const token = { mesh, visible: true, document: { x: 0, y: 0, rotation: 0, width: 1, height: 1, texture: {} } };
  const done = player.play(token, stage('sink'), { x: 1, y: 0 }, 'owner');
  t = 500; queued(t);
  assert.ok(mesh.alpha < 1 && mesh.scale.y < 1 && mesh.position.y > 20);
  t = 1200; queued(t);
  await done;
  assert.equal(mesh.alpha, 1); assert.equal(mesh.scale.y, 1); assert.equal(mesh.position.y, 20);
});


const hold = (motion, extra = {}) => ({ kind: 'motion', motion, duration: 1000, distance: 3, intensity: 1, motionRange: 'distance', motionHeading: 'away', motionEnd: 'hold', ...extra });

test('a held path motion ends at its offset instead of coming back', () => {
  for (const motion of ['rush', 'leap', 'roll']) {
    const end = motionPose(hold(motion, { motionOffset: { x: 2, y: -1 } }), 1, { x: 1, y: 0 }, 100);
    assert.ok(Math.abs(end.x - 200) < 1e-6, `${motion} x`);
    assert.ok(Math.abs(end.y + 100) < 1e-6, `${motion} y`);
  }
  const returning = motionPose({ ...hold('rush'), motionEnd: undefined }, 1, { x: 1, y: 0 }, 100);
  assert.deepEqual(returning, { x: 0, y: 0, rotation: 0, scale: 1 }, 'without hold it still settles at rest');
});

test('a held motion without an offset ends at its authored distance and heading', () => {
  const end = motionPose(hold('rush'), 1, { x: 1, y: 0 }, 100);
  assert.ok(Math.abs(end.x + 300) < 1e-6, 'away from the other token, 3 squares');
});

test('fade dims the token and, when held, stays invisible at the end', () => {
  assert.equal(MOTIONS.fade, 'Fade out');
  assert.ok(GENERATED_MOTION_DURATION.fade > 0);
  const fade = { kind: 'motion', motion: 'fade', duration: 900, intensity: 1 };
  assert.ok(motionPose(fade, 0.5).alpha > 0 && motionPose(fade, 0.5).alpha < 1);
  assert.deepEqual(motionPose(fade, 1), { x: 0, y: 0, rotation: 0, scale: 1 });
  assert.equal(motionPose({ ...fade, motionEnd: 'hold' }, 1).alpha, 0);
});

test('a held pose stays put, then eases back to rest if nothing moves the token', () => {
  const stage = hold('rush', { motionOffset: { x: 2, y: 0 } });
  assert.ok(Math.abs(heldPose(stage, 0, { x: 1, y: 0 }, 100).x - 200) < 1e-6);
  assert.ok(Math.abs(heldPose(stage, HOLD_LIMIT_MS, { x: 1, y: 0 }, 100).x - 200) < 1e-6);
  const easing = heldPose(stage, HOLD_LIMIT_MS + HOLD_RELEASE_MS / 2, { x: 1, y: 0 }, 100).x;
  assert.ok(easing > 0 && easing < 200);
  assert.equal(heldPose(stage, HOLD_LIMIT_MS + HOLD_RELEASE_MS, { x: 1, y: 0 }, 100), null);
  assert.equal(heldPose({ ...stage, motionEnd: undefined }, 0, { x: 1, y: 0 }, 100), null);
});

test('validation keeps hold and offset only where they mean something', () => {
  const v = (stage) => validateRecipe({ id: 'h', name: 'H', trigger: 'manual', stages: [{ assets: [], ...stage }] }).stages[0];
  assert.equal(v(hold('leap')).motionEnd, 'hold');
  assert.deepEqual(v(hold('leap', { motionOffset: { x: 30, y: -1.5 } })).motionOffset, { x: 20, y: -1.5 });
  assert.equal(v({ kind: 'motion', motion: 'shake', motionEnd: 'hold' }).motionEnd, undefined);
  assert.equal(v({ kind: 'motion', motion: 'fade', motionEnd: 'hold', motionOffset: { x: 1, y: 1 } }).motionOffset, undefined);
});

test('the player keeps a held mesh at its end pose after the motion resolves', async () => {
  let now = 0, queued = null;
  const player = new TokenMotionPlayer({ frame: (cb) => (queued = cb), cancel: () => {}, now: () => now, grid: () => 100 });
  const mesh = { position: { x: 100, y: 100, set(x, y) { this.x = x; this.y = y; } }, rotation: 0, scale: { x: 1, y: 1, set(x, y) { this.x = x; this.y = y; } }, alpha: 1 };
  const token = { mesh, visible: true, document: { x: 50, y: 50, rotation: 0, width: 1, height: 1, texture: {} } };
  const done = player.play(token, hold('rush', { motionOffset: { x: 2, y: 0 }, duration: 100 }), { x: 1, y: 0 }, 'me');
  now = 150; queued(now);
  assert.equal(await done, true, 'callers continue once the travel lands');
  assert.equal(mesh.position.x, 300, 'held at the landing square');
  assert.ok(player.active.has(token), 'still holding until the document moves or the hold times out');
});

test('a held travel rebases onto the moved document and keeps the later collapse playing', async () => {
  let now = 0, queued = null;
  const player = new TokenMotionPlayer({ frame: (cb) => (queued = cb), cancel: () => {}, now: () => now, grid: () => 100 });
  const mesh = { position: { x: 100, y: 100, set(x, y) { this.x = x; this.y = y; } }, rotation: 0, scale: { x: 1, y: 1, set(x, y) { this.x = x; this.y = y; } }, alpha: 1 };
  const token = { mesh, visible: true, document: { x: 50, y: 50, rotation: 0, width: 1, height: 1, texture: {} } };
  void player.play(token, hold('rush', { motionOffset: { x: 2, y: 0 }, duration: 100 }), { x: 1, y: 0 }, 'me');
  const fall = player.play(token, { kind: 'motion', motion: 'collapse', duration: 1000, distance: 0.25, intensity: 0.8, motionRange: 'distance' }, { x: 1, y: 0 }, 'me');
  now = 150; queued(now);
  assert.equal(mesh.position.x, 300, 'the rush landed two squares over');
  token.document.x += 200;
  now = 300; queued(now);
  assert.ok(player.active.has(token), 'the run survives the document write');
  assert.notEqual(mesh.rotation, 0, 'the collapse still tips the token');
  assert.equal(mesh.position.x, 300, 'new base (100 + 200) plus the collapse x (0)');
  now = 1200; queued(now);
  assert.equal(await fall, true);
  assert.ok(!player.active.has(token));
});

test('a moved document without a held track still ends the run in place', () => {
  let now = 0, queued = null;
  const player = new TokenMotionPlayer({ frame: (cb) => (queued = cb), cancel: () => {}, now: () => now, grid: () => 100 });
  const mesh = { position: { x: 100, y: 100, set(x, y) { this.x = x; this.y = y; } }, rotation: 0, scale: { x: 1, y: 1, set(x, y) { this.x = x; this.y = y; } }, alpha: 1 };
  const token = { mesh, visible: true, document: { x: 50, y: 50, rotation: 0, width: 1, height: 1, texture: {} } };
  void player.play(token, { kind: 'motion', motion: 'collapse', duration: 1000, distance: 0.25, intensity: 0.8 }, { x: 1, y: 0 }, 'me');
  now = 100; queued(now);
  token.document.x += 200;
  now = 200; queued(now);
  assert.ok(!player.active.has(token));
});
