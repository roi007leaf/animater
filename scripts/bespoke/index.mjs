// Registry of bespoke compositions; one file per review area so authors never collide.
import pf2eSpellsA from './pf2e-spells-a.mjs';
import pf2eSpellsB from './pf2e-spells-b.mjs';
import pf2eSpellsC from './pf2e-spells-c.mjs';
import pf2eSpellsD from './pf2e-spells-d.mjs';
import pf2eFeatsA from './pf2e-feats-a.mjs';
import pf2eFeatsB from './pf2e-feats-b.mjs';
import pf2eFeatsC from './pf2e-feats-c.mjs';
import pf2eWeapons from './pf2e-weapons.mjs';
import pf2eStates from './pf2e-states.mjs';
import sf2e from './sf2e.mjs';
import dnd5eSpells from './dnd5e-spells.mjs';
import dnd5eFeatures from './dnd5e-features.mjs';
import dnd5eItemsWeapons from './dnd5e-items-weapons.mjs';
export const BESPOKE = Object.freeze(Object.assign({}, pf2eSpellsA, pf2eSpellsB, pf2eSpellsC, pf2eSpellsD, pf2eFeatsA, pf2eFeatsB, pf2eFeatsC, pf2eWeapons, pf2eStates, sf2e, dnd5eSpells, dnd5eFeatures, dnd5eItemsWeapons));
