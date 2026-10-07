import test from 'node:test';
import assert from 'node:assert/strict';
import {PF2E_EFFECTS} from '../scripts/state-catalog.mjs';
const entry=name=>{const row=PF2E_EFFECTS.find(e=>e.name===name);assert.ok(row,name);return row;};
test('speed penalties and penalties that end on healing are not enhancements',()=>{
 for(const name of ['Spell Effect: Equal Footing (Success)','Effect: Glue Bomb','Effect: Hamstring','Effect: Sight Prey (Speed Penalty)','Effect: Chthonic Mucus'])assert.equal(entry(name).theme,'slow',name);
 for(const name of ['Effect: Remove Face','Effect: -2 circumstance penalty to attack rolls until healed','Effect: Spore Feedback'])assert.equal(entry(name).theme,'curse',name);
});
test('mental unholy penalties, choice injuries and literal light keep native semantics',()=>{
 for(const name of ['Effect: Whisper Earworm (Critical Failure)','Effect: Aura of Sophistry (Unholy)','Spell Effect: Synesthesia (Success)'])assert.equal(entry(name).theme,'mind',name);
 for(const name of ['Spell Effect: Necrotize (Failure)','Effect: Called Shot','Effect: Targeting Finisher','Effect: Wither Away'])assert.equal(entry(name).theme,'curse',name);
 for(const name of ['Effect: Draft of Stellar Radiance','Effect: Shimmering Dust'])assert.equal(entry(name).theme,'light',name);
 assert.equal(entry('Effect: Fiddle').theme,'music');
 assert.equal(entry('Effect: Talented Tap Shoes').theme,'speed');
});
