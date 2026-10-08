import { catalogSpell } from "./spell-catalog.mjs";
import { catalogFeat } from "./feat-catalog.mjs";
import { catalogWeapon } from "./weapon-catalog.mjs";
import { catalogStateEntry } from "./state-catalog.mjs";
import { PF2E_ACTION_CATALOG, PF2E_FEATURE_CATALOG } from "./ability-catalog.mjs";

const catalogs = {
  spell: { get: catalogSpell, pack: "spells-srd" },
  feat: { get: catalogFeat, pack: "feats-srd" },
  weapon: { get: catalogWeapon, pack: "equipment-srd" },
  action: { get: PF2E_ACTION_CATALOG.entry, pack: "actionspf2e" },
  feature: { get: PF2E_FEATURE_CATALOG.entry, pack: "classfeatures" },
  condition: { get: catalogStateEntry },
  effect: { get: catalogStateEntry },
};
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export function catalogNameHTML(item, kind, environment = {}) {
  const demo = environment.demo === true;
  return `<button type="button" class="an-catalog-name" data-action="item-details" data-kind="${esc(kind)}" data-id="${esc(item.id)}" aria-label="Open ${esc(item.name)} details" data-tooltip="${demo ? "Item details open inside Foundry" : "Open native Foundry item sheet"}" ${demo ? "disabled" : ""}>${esc(item.name)}</button>`;
}

export async function openCatalogDetails(w, kind, id) {
  const catalog = catalogs[kind];
  const entry = catalog?.get(id);
  if (!entry) throw Error("Choose an item from the catalog to open its details.");
  if (w.host.environment?.().demo)
    throw Error("Item details open inside Foundry.");
  const item = await w.host.resolveItem?.(entry.uuid ?? `Compendium.pf2e.${catalog.pack}.Item.${entry.id}`);
  if (!item?.sheet)
    throw Error(`The PF2e compendium entry for ${entry.name} is unavailable. Check that Pathfinder 2e is installed.`);
  await item.sheet.render({ force: true });
}
