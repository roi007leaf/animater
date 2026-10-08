import test from 'node:test';
import assert from 'node:assert/strict';
import {TokenFxPreviewClock} from '../scripts/token-fx-preview-clock.mjs';

const clock=(animated,values={},random=()=>.5)=>{
  const puppet={...values,animated},player=new TokenFxPreviewClock(puppet,{random});
  player.animated=animated;player.initAnimatedInternals(animated);return {puppet,player};
};
test('local shader time follows elapsed milliseconds without a world ticker or Foundry globals',()=>{
  const {puppet,player}=clock({time:{animType:'move',speed:-.001}},{time:3});
  player.animate(250);player.animate(750);assert.equal(puppet.time,2);
  player.animate(-100);assert.equal(puppet.time,2);
  assert.equal(player.hasInternals('time'),true);
});
test('local pulse and color interpolation preserve native preset ranges and synchronized phase',()=>{
  const {puppet,player}=clock({
    pulse:{animType:'syncCosOscillation',val1:2,val2:6,loopDuration:1000},
    color:{animType:'colorOscillation',val1:0xff0000,val2:0x0000ff,loopDuration:1000},
    wave:{animType:'sinOscillation',val1:0,val2:8,loopDuration:1000},
  });
  player.animate(250);assert.equal(puppet.pulse,4);assert.equal(puppet.color,0x7f007f);assert.equal(puppet.wave,0);
  player.animate(250);assert.equal(puppet.pulse,6);assert.equal(puppet.color,0x0000ff);assert.ok(Math.abs(puppet.wave-4)<1e-8);
});
test('preview loops respect pauses and stop at their final values without document writes',()=>{
  const animated={time:{animType:'move',speed:1,loops:2,loopDuration:1000,pauseBetweenDuration:300}};
  const {puppet,player}=clock(animated,{time:0});
  player.animate(1100);assert.equal(puppet.time,1000);
  player.animate(100);assert.equal(puppet.time,1000);
  player.animate(500);assert.equal(puppet.time,1400);
  player.animate(2000);assert.equal(puppet.time,2000);assert.equal(animated.time.active,false);
  player.animate(500);assert.equal(puppet.time,2000);
});
test('random per-loop values stay steady between loops; clockwise and half pulses retain direction',()=>{
  const {puppet,player}=clock({
    count:{animType:'randomNumberPerLoop',val1:2,val2:10,loopDuration:1000,wantInteger:true},
    angle:{animType:'rotation',loopDuration:1000,clockWise:false},
    fade:{animType:'halfCosOscillation',val1:1,val2:0,loopDuration:1000,loops:1},
  },{count:2});
  player.animate(500);assert.equal(puppet.count,2);assert.equal(puppet.angle,180);assert.ok(Math.abs(puppet.fade-.5)<1e-8);
  player.animate(500);assert.equal(puppet.count,6);assert.equal(puppet.fade,0);
  player.animate(200);assert.equal(puppet.count,6);
});
test('clock exposes every native animation mode to Token Magic parameter normalization',()=>{
  const player=new TokenFxPreviewClock();
  for(const mode of ['move','moveToward','rotation','syncRotation','cosOscillation','halfCosOscillation',
    'sinOscillation','halfSinOscillation','chaoticOscillation','colorOscillation','halfColorOscillation',
    'syncCosOscillation','syncSinOscillation','syncChaoticOscillation','syncColorOscillation',
    'randomNumber','randomNumberPerLoop','randomColor','randomColorPerLoop'])assert.equal(typeof player[mode],'function',mode);
});
