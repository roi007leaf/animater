// Every domain's card designs, merged: card id → design record (schema and builder in
// scripts/daggerheart-card-design.mjs; guide in docs/daggerheart-designs/README.md).
// Each domain lives in its own file; authors edit only their domain's file, never this index.
import arcana from "./arcana.mjs";
import blade from "./blade.mjs";
import bone from "./bone.mjs";
import codex from "./codex.mjs";
import dread from "./dread.mjs";
import grace from "./grace.mjs";
import midnight from "./midnight.mjs";
import sage from "./sage.mjs";
import splendor from "./splendor.mjs";
import valor from "./valor.mjs";

export const DOMAIN_DESIGNS = Object.freeze({ arcana, blade, bone, codex, dread, grace, midnight, sage, splendor, valor });
export const CARD_DESIGNS = Object.freeze(Object.assign({}, ...Object.values(DOMAIN_DESIGNS)));
