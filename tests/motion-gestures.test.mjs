import test from 'node:test';
import assert from 'node:assert/strict';
import { MOTIONS } from '../scripts/model.mjs';
import { motionPose, combineMotionPoses, poseTransform, TokenMotionPlayer } from '../scripts/motion.mjs';
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
