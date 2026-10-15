import test from 'node:test';
import assert from 'node:assert/strict';
import { MOTIONS, validateRecipe } from '../scripts/model.mjs';
import { motionPose, motionDirection, combineMotionPoses, poseTransform, TokenMotionPlayer, heldPose, HOLD_LIMIT_MS, HOLD_RELEASE_MS } from '../scripts/motion.mjs';
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

const pathStage = (extra = {}) => ({ kind: 'motion', motion: 'path', subject: 'targets', duration: 1000, motionEnd: 'hold', intensity: 1,
  keyframes: [{ at: 0 }, { at: 0.5, x: 1, y: 1, rotation: 90, ease: 'linear' }, { at: 1, x: 2, y: 0, scale: 0.5, ease: 'linear' }], ...extra });
const v = (stage) => validateRecipe({ id: 'p', name: 'P', trigger: 'manual', stages: [{ assets: [], ...stage }] }).stages[0];

test('a keyframed path moves the real token through its points, away from the other token', () => {
  assert.equal(MOTIONS.path, 'Keyframed path');
  assert.ok(GENERATED_MOTION_DURATION.path > 0);
  const s = v(pathStage());
  const mid = motionPose(s, 0.5, { x: 1, y: 0 }, 100);
  assert.ok(Math.abs(mid.x - 100) < 1e-6 && Math.abs(mid.y - 100) < 1e-6);
  assert.ok(Math.abs(mid.rotation - Math.PI / 2) < 1e-6);
  const end = motionPose(s, 1, { x: 1, y: 0 }, 100);
  assert.ok(Math.abs(end.x - 200) < 1e-6 && Math.abs(end.scale - 0.5) < 1e-6, 'held at the last keyframe');
  const turned = motionPose(s, 1, { x: 0, y: 1 }, 100);
  assert.ok(Math.abs(turned.y - 200) < 1e-6 && Math.abs(turned.x) < 1e-6, 'the frame turns with the direction');
});

test('a finisher frame aims and shrinks the path, ignoring the motion direction', () => {
  const end = motionPose(v(pathStage({ motionFrame: { cos: 0, sin: -1, k: 0.5 } })), 1, { x: 1, y: 0 }, 100);
  assert.ok(Math.abs(end.x) < 1e-6 && Math.abs(end.y + 100) < 1e-6);
});

test('without hold, a path plays in the first 85% and settles back to rest', () => {
  const s = v(pathStage({ motionEnd: undefined }));
  const last = motionPose(s, 0.85, { x: 1, y: 0 }, 100);
  assert.ok(Math.abs(last.x - 200) < 1e-6, 'reaches the last keyframe at 85%');
  assert.deepEqual(motionPose(s, 1, { x: 1, y: 0 }, 100), { x: 0, y: 0, rotation: 0, scale: 1 });
  const settling = motionPose(s, 0.95, { x: 1, y: 0 }, 100).x;
  assert.ok(settling > 0 && settling < 200);
});

test('opacity is only touched when a keyframe fades', () => {
  assert.equal(motionPose(v(pathStage()), 0.5, { x: 1, y: 0 }, 100).alpha, undefined);
  const faded = v(pathStage({ keyframes: [{ at: 0 }, { at: 1, alpha: 0 }] }));
  assert.equal(motionPose(faded, 1, { x: 1, y: 0 }, 100).alpha, 0);
});

test('validation repairs path keyframes and keeps the finisher frame only on paths', () => {
  assert.equal(v({ kind: 'motion', motion: 'path' }).keyframes.length, 2, 'an old or empty path gets the default shove');
  assert.equal(v({ kind: 'motion', motion: 'path', keyframes: 'garbage' }).keyframes.at(-1).x, 1);
  assert.deepEqual(v(pathStage({ motionFrame: { cos: 2, sin: -1, k: 4 } })).motionFrame, { cos: 1, sin: -1, k: 1 });
  assert.equal(v({ kind: 'motion', motion: 'rush', motionFrame: { cos: 1, sin: 0, k: 1 }, keyframes: [] }).motionFrame, undefined);
  assert.equal(v({ kind: 'motion', motion: 'rush', keyframes: [] }).keyframes, undefined);
  assert.equal(v(pathStage()).motionEnd, 'hold', 'a path may hold where it lands');
});

test('a path faces away from the other token, like a recoil', () => {
  const token = { center: { x: 100, y: 0 } }, other = { center: { x: 0, y: 0 } };
  const dir = motionDirection(token, other, token, 'path', 100);
  assert.ok(Math.abs(dir.x - 1) < 1e-6 && Math.abs(dir.y) < 1e-6);
});

test('a path or recoil with no other token faces +x wherever the token stands', () => {
  const token = { id: 't', center: { x: 1250, y: 450 } };
  for (const motion of ['path', 'recoil']) {
    assert.deepEqual(motionDirection(token, token, null, motion, 100), { x: 1, y: 0 }, `${motion}: token is its own source, no target`);
    assert.deepEqual(motionDirection(token, null, token, motion, 100), { x: 1, y: 0 }, `${motion}: no source`);
    assert.deepEqual(motionDirection(token, token, token, motion, 100), { x: 1, y: 0 }, `${motion}: self-only`);
  }
});

test('an overshooting ease never turns a path inside out or past fully visible', () => {
  const kf = (at, extra = {}) => ({ at, x: 0, y: 0, rotation: 0, scale: 1, alpha: 1, ease: 'linear', sharp: false, ...extra });
  const shrink = { kind: 'motion', motion: 'path', motionEnd: 'hold', keyframes: [kf(0), kf(1, { scale: 0.05, ease: 'easeOutBack' })] };
  const fade = { kind: 'motion', motion: 'path', motionEnd: 'hold', keyframes: [kf(0), kf(0.5, { alpha: 0.9 }), kf(1, { alpha: 0, ease: 'easeOutBack' })] };
  for (let n = 0; n <= 100; n++) {
    assert.ok(motionPose(shrink, n / 100).scale >= 0.01, `scale at ${n}%`);
    const alpha = motionPose(fade, n / 100).alpha ?? 1;
    assert.ok(alpha >= 0 && alpha <= 1, `alpha at ${n}%`);
  }
});

const stretchy = (extra = {}) => v(pathStage({ keyframes: [{ at: 0 }, { at: 0.5, x: 1, stretch: 0.2, ease: 'linear' }, { at: 1, x: 2, ease: 'linear' }], ...extra }));
test('a stretched path stretches the token along its travel direction', () => {
  const along = motionPose(stretchy(), 0.5, { x: 1, y: 0 }, 100);
  assert.ok(along.scaleX > 1 && 1 > along.scaleY, `x ${along.scaleX} y ${along.scaleY}`);
  assert.equal(along.scale, 1, 'uniform size stays its own channel');
  const down = motionPose(stretchy(), 0.5, { x: 0, y: 1 }, 100);
  assert.ok(Math.abs(down.scaleX - along.scaleY) < 1e-9 && Math.abs(down.scaleY - along.scaleX) < 1e-9, 'turned with the direction');
  assert.equal(motionPose(v(pathStage()), 0.5, { x: 1, y: 0 }, 100).scaleX, undefined, 'an unstretched path never touches scaleX/scaleY');
});

test('a frame-aimed stretched path uses the frame angle, not the direction', () => {
  const aimed = motionPose(stretchy({ motionFrame: { cos: 0, sin: 1, k: 1 } }), 0.5, { x: 1, y: 0 }, 100);
  assert.ok(aimed.scaleY > 1 && 1 > aimed.scaleX, `x ${aimed.scaleX} y ${aimed.scaleY}`);
});

test('the stretch is measured against the pose rotation', () => {
  const turned = v(pathStage({ keyframes: [{ at: 0 }, { at: 0.5, x: 1, rotation: 90, stretch: 0.2, ease: 'linear' }, { at: 1, x: 2, rotation: 90, ease: 'linear' }] }));
  const p = motionPose(turned, 0.5, { x: 1, y: 0 }, 100);
  assert.ok(p.scaleY > 1 && 1 > p.scaleX, 'a token turned 90 degrees stretches along its own y');
});

test('a returning stretched path settles its stretch back to rest with the other channels', () => {
  const s = stretchy({ motionEnd: undefined, keyframes: [{ at: 0 }, { at: 1, x: 2, stretch: 0.3, ease: 'linear' }] });
  const reached = motionPose(s, 0.85, { x: 1, y: 0 }, 100), settling = motionPose(s, 0.95, { x: 1, y: 0 }, 100);
  assert.ok(settling.scaleX > 1 && settling.scaleX < reached.scaleX, `${settling.scaleX} between 1 and ${reached.scaleX}`);
});

test('squash on impact flattens along the direction, springs back and rests at both ends', () => {
  assert.equal(MOTIONS.squash, 'Squash on impact');
  assert.equal(GENERATED_MOTION_DURATION.squash, 450);
  const s = v({ kind: 'motion', motion: 'squash', duration: 450, intensity: 1 });
  assert.equal(s.motion, 'squash');
  assert.equal(s.motionEnd, undefined, 'never holds');
  for (const p of [0, 1]) assert.deepEqual(motionPose(s, p, { x: 1, y: 0 }, 100), { x: 0, y: 0, rotation: 0, scale: 1 });
  const flat = motionPose(s, 0.225, { x: 1, y: 0 }, 100);
  assert.ok(flat.scaleX < 1 && flat.scaleY > 1, `flattened along x: ${flat.scaleX} ${flat.scaleY}`);
  assert.ok(Math.abs(flat.scaleX - 0.65) < 1e-9, 'full squash of 0.35 at its peak');
  assert.deepEqual([flat.x, flat.y, flat.rotation], [0, 0, 0], 'no position change');
  const across = motionPose(s, 0.225, { x: 0, y: 1 }, 100);
  assert.ok(across.scaleY < 1 && across.scaleX > 1, 'flattened along y for a downward hit');
  const spring = motionPose(s, 0.6, { x: 1, y: 0 }, 100);
  assert.ok(spring.scaleX > 1, 'springs back past rest');
  const end = motionPose(s, 0.999, { x: 1, y: 0 }, 100);
  assert.ok(Math.abs(end.scaleX - 1) < 1e-3, 'settled by the end');
});

test('squash faces away from the other token like a recoil, with a +x fallback', () => {
  const token = { id: 't', center: { x: 0, y: 100 } }, other = { center: { x: 0, y: 0 } };
  const dir = motionDirection(token, other, token, 'squash', 100);
  assert.ok(Math.abs(dir.x) < 1e-6 && Math.abs(dir.y - 1) < 1e-6);
  assert.deepEqual(motionDirection(token, token, null, 'squash', 100), { x: 1, y: 0 });
});

test('a held stretched end eases its stretch back with the rest of the hold', () => {
  const s = v(pathStage({ keyframes: [{ at: 0 }, { at: 1, stretch: 0.3, ease: 'linear' }] }));
  const held = heldPose(s, 0, { x: 1, y: 0 }, 100), releasing = heldPose(s, HOLD_LIMIT_MS + HOLD_RELEASE_MS / 2, { x: 1, y: 0 }, 100);
  assert.ok(held.scaleX > 1.29, 'held stretched');
  assert.ok(releasing.scaleX > 1 && releasing.scaleX < held.scaleX && releasing.scaleY < 1 && releasing.scaleY > held.scaleY, 'easing back');
});
