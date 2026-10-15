// Which finishers an item plays, and the link between a catalog entry and a finisher.
// Applies-to reuses recipe matching: comma-separated names in `match`, or one exact itemUuid.
import { normalize, FINISHER_ON } from "./model.mjs";
import { pathSquares, landsTilted } from "./keyframe-path.mjs";

const names = (r) => String(r.match ?? "").split(",").map((n) => n.trim()).filter(Boolean);
const live = (recipes) => recipes.filter((r) => r?.finisher && r.enabled !== false);

export function matchFinishers(recipes, { itemName, itemSlug, itemUuid } = {}, on) {
  const wanted = new Set([itemName, itemSlug].filter(Boolean).map(normalize));
  return live(recipes).filter((r) => r.finisher.on === on &&
    ((r.itemUuid && itemUuid && r.itemUuid === itemUuid) || names(r).some((n) => wanted.has(normalize(n)))));
}

// The killing item's own kill finisher wins; otherwise the GM's default, if it is a finisher.
// "Needs: Critical only" holds for both: without a crit they are passed over.
export function killFinisher(recipes, item = {}, defaultId = "", { crit = false } = {}) {
  const fits = (r) => passesSuccess(r.finisher, crit ? "criticalSuccess" : "success");
  return matchFinishers(recipes, item, "kill").find(fits) ?? live(recipes).find((r) => r.id === defaultId && fits(r)) ?? null;
}

export function passesSuccess(finisher, outcome) {
  if (outcome === undefined || outcome === null) return true;
  return finisher.success === "critical" ? outcome === "criticalSuccess" : ["success", "criticalSuccess"].includes(outcome);
}

// A roll whose outcome is unknown (D&D with several targets or a hidden AC) may be a miss:
// skip it. Only a use without any roll passes without an outcome.
export function usePasses(finisher, event) {
  const moment = finisherMoment(event);
  if (!moment || (moment === "roll" && (event.outcome === undefined || event.outcome === null))) return false;
  return passesSuccess(finisher, event.outcome);
}

// A use finisher rides the roll that has a degree of success when the item has one,
// else the use itself (a buff, a save spell). Damage rolls never carry it.
export function finisherMoment(event) {
  if (["attack", "check"].includes(event?.type)) return "roll";
  if (event?.type !== "use") return null;
  const traits = event.item?.system?.traits?.value ?? [];
  const rolls = ["weapon", "melee"].includes(event.item?.type) || traits.includes("attack") || event.activity?.type === "attack";
  return rolls ? null : "use";
}

// PF2e/SF2e actions such as Shove roll a skill check that names the action (action:shove);
// normal dispatch ignores skill checks, so finishers read them here.
export function checkFinisherEvent(message, systemId, userId) {
  const context = message?.flags?.[systemId]?.context;
  if ((message?.author?.id ?? message?.user?.id) !== userId || context?.type !== "skill-check") return null;
  // Hidden or repeated rolls stay quiet, as normal dispatch does (twoeEvent).
  if (message.blind || message.whisper?.length || context.isReroll) return null;
  const action = (context.options ?? []).map(String).find((o) => o.startsWith("action:"))?.slice(7);
  if (!action) return null;
  return { type: "check", systemId, id: `finisher-check:${message.id}`, messageId: message.id, itemName: action, tokenId: message.speaker?.token, sceneId: message.speaker?.scene, targetUuid: context.target?.token, outcome: context.outcome };
}

// The catalog dropdown: the entry belongs to at most one finisher.
export function linkFinisher(recipes, entryName, finisherId) {
  const key = normalize(entryName);
  return recipes.map((r) => {
    if (!r?.finisher) return r;
    const kept = names(r).filter((n) => normalize(n) !== key);
    if (r.id === finisherId) kept.push(String(entryName).trim());
    const match = kept.join(", ");
    return match === String(r.match ?? "") ? r : { ...r, match };
  });
}

export const linkedFinisher = (recipes, entryName) =>
  live(recipes).find((r) => names(r).some((n) => normalize(n) === normalize(entryName))) ?? null;

// The active GM writes a finisher's move for a player who controls the moved token or the
// token that struck it (a fighter flinging an enemy they do not own).
export const mayDisplace = ({ ownsToken, ownsAttacker }) => Boolean(ownsToken || ownsAttacker);

// The mover's held keyframed path: its drawn length is the knockback.
export const finisherTravelPath = (recipe) => recipe?.stages?.find((s) => s.kind === "motion" && s.motion === "path" && s.motionEnd === "hold"
  && (s.subject ?? "source") === (recipe.finisher?.mover ?? "targets")) ?? null;

const ENDING_SHORT = { vanish: "Vanish", body: "Body", stay: "Stay" };
// What the studio chip says about a finisher: when it plays, where it lands, how it ends.
export function finisherChipText(recipe) {
  const f = recipe.finisher, path = finisherTravelPath(recipe), squares = path ? pathSquares(path.keyframes) : f.knockback;
  return `${FINISHER_ON[f.on]} · ${squares ? `lands ${squares} sq` : "in place"} · ${ENDING_SHORT[f.ending]}${path && landsTilted(path.keyframes) ? " · ⚠ lands tilted" : ""}`;
}
