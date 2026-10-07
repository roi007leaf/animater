import { ID, matchRecipe, planRecipe, validateRecipe } from "./model.mjs";
import { OPTIONAL_FX_KINDS } from './optional-fx.mjs';
import { applyEffectOptions, applyMediaOptions } from "./stage-options.mjs";
import { tokenFootprint, effectFootprint, artworkSize, offsetInGridSquares, beamGeometry } from "./media-preview.mjs";
import { prepareRecipeSounds } from "./spell-sounds.mjs";
import { registeredMedia, mediaForReference } from './media-library-model.mjs';
export class AnimaterRuntime {
  constructor(host) {
    this.host = host;
    this.log = [];
    this.seen = new Set();
    this.catalog = [];
    this.sessions = new Set();
    this.pending = new Map();
    this.preparations = new Map();
    this.epoch = 0;
    this.previewAreas = new Set();
  }
  trace(status, detail, recipe = null) {
    this.log.unshift({
      time: new Date().toLocaleTimeString(),
      status,
      detail,
      recipe: recipe?.name ?? "",
    });
    this.log.length = Math.min(this.log.length, 40);
    this.host.onTrace?.();
  }
  refreshCatalog() {
    this.catalog = registeredMedia(this.host.database).filter(a => a.type !== 'audio').sort((a,b)=>a.key.localeCompare(b.key));
    return this.catalog;
  }
  getCatalog() {
    return this.catalog.length ? this.catalog : this.refreshCatalog();
  }
  async dispatch(event) {
    if (!event || !this.host.enabled()) return;
    if (event.id && this.seen.has(event.id)) return;
    if (event.id) {
      this.seen.add(event.id);
      if (this.seen.size > 500)
        this.seen.delete(this.seen.values().next().value);
    }
    const saved = this.host.recipes();
    const recipe = this.host.resolveRecipe
      ? this.host.resolveRecipe(event, saved)
      : (matchRecipe(saved, event) ?? this.host.catalogRecipe?.(event, saved));
    if (!recipe)
      return this.trace(
        "Skipped",
        `${event.item?.name ?? "Unknown item"}: no enabled ${event.type} recipe.`,
      );
    try {
      await this.play(recipe, {...event,automatic:true});
    } catch (error) {
      this.trace("Blocked", error.message, recipe);
    }
  }
  async play(recipe, context, { preview = false, onStart } = {}) {
    recipe = validateRecipe(recipe);
    const epoch = this.epoch;
    let area;
    try {
      if (preview && this.host.ready()) {
        area = await this.host.previewArea?.(recipe, context);
        if (area) this.previewAreas.add(area);
      }
      if (this.epoch !== epoch) return null;
      return await this.playPrepared(
        recipe,
        area ? { ...area.context, previewFootprint: true } : context,
        {
          preview,
          onStart,
        },
      );
    } finally {
      if (area) {
        if (this.previewAreas.delete(area)) area.cleanup();
      }
    }
  }
  async playPrepared(recipe, context, { preview = false, onStart } = {}) {
    if(!preview && context.automatic && recipe.playbackRoles?.automatic==='requires-role-resolution')
      throw Error(recipe.playbackRoles.reason);
    if (recipe.lifecycle === "document" && !preview)
      throw Error("Enable this condition or effect in its catalog. Native documents control its lifetime; use Local canvas preview to test it.");
    recipe = prepareRecipeSounds(recipe, this.host.soundCatalog?.());
    if (!this.host.ready())
      throw Error("Activate Sequencer, then reload Foundry.");
    if (!this.catalog.length) this.refreshCatalog();
    if (!preview && !this.host.canPlay(context))
      throw Error("You need ownership of the source token.");
    let plan = planRecipe(recipe, this.catalog, {
      ...context,
      preview,
      gridSize: this.host.gridSize?.() ?? 100,
    });
    if (
      !preview &&
      plan.some((s) => s.kind === "motion" || s.kind === "tokenfx" && !s.catalogFx && this.host.fxCatalog?.().tokenReady) &&
      this.host.canSyncMotion?.() === false
    )
      throw Error(
        "Foundry has not registered Animater's token-motion channel. Stop and start the Foundry server instance serving this world, then reload connected clients. Local preview is available now.",
      );
    if(!preview&&this.host.canSyncMotion?.()===false&&plan.some(s=>s.kind==='tokenfx'&&s.catalogFx)) {
      plan=plan.filter(s=>s.kind!=='tokenfx'||!s.catalogFx);
      this.trace('Skipped','Catalog token filters: synchronization channel unavailable.');
    }
    const session = `${ID}-${this.host.userId()}-${crypto.randomUUID()}`;
    const epoch = this.epoch;
    let failed = false;
    const groups = new Map();
    for (const s of plan) {
      if (!groups.has(s.delay)) groups.set(s.delay, []);
      groups.get(s.delay).push(s);
    }
    const build = (stages) => {
      const sequence = this.host.sequence();
      for (const s of stages) {
        if (s.kind === "motion" || OPTIONAL_FX_KINDS.has(s.kind)) continue;
        if (s.kind === "sound") {
          const sound = sequence
            .sound()
            .file(s.soundFile)
            .name(session)
            .playIf(() => this.epoch === epoch && !failed)
            .duration(s.duration)
            .volume(s.volume);
          applyMediaOptions(sound, s);
          if (s.fadeIn) sound.fadeInAudio(s.fadeIn, { ease: s.ease });
          if (s.fadeOut) sound.fadeOutAudio(s.fadeOut, { ease: s.ease });
          continue;
        }
        const e = sequence
          .effect()
          .name(session)
          .playIf(() => this.epoch === epoch && !failed)
          // Sequencer uses media milliseconds before applying skips/rate.
          // Recipe durations, motion and stage links use elapsed milliseconds.
          .duration(s.duration * s.playbackRate + (s.clipEnd ? 0 : s.clipStart))
          .opacity(s.opacity);
        if (s.kind === "sprite") e.copySprite(s.destination);
        else e.file(s.asset);
        const location = {
          offset: offsetInGridSquares(s, s.destination, this.host.gridSize?.() ?? 100),
          gridUnits: true,
        };
        const media = mediaForReference(this.catalog, s.asset);
        const grid = this.host.gridSize?.() ?? 100;
        if (s.kind === "projectile") {
          e.atLocation(s.origin, location)
            .size(artworkSize(tokenFootprint(s.origin, grid) * s.scale, media))
            .moveTowards(s.landing ?? s.endpoint, {
              delay: s.moveDelay,
              ease: s.moveEase,
              rotate: false,
              cacheLocation: true,
            });
        } else if (s.kind === "travel") {
          // Sequencer divides distance by scale.x. A scalar cancels its own
          // thickness; keep x=1 so the user's scale controls beam thickness.
          e.atLocation(s.origin, location)
            .stretchTo(s.endpoint)
            .scale({ x: 1, y: s.scale });
          if (["failure", "criticalFailure"].includes(context.outcome))
            e.missed();
        } else if (s.kind === "template") {
          if (s.areaTile) {
            e.atLocation(s.areaTile.center, location).size(
              artworkSize(s.areaTile.width * s.scale, media),
            );
          } else if (["line", "cone"].includes(context.area.type)) {
            const g = beamGeometry(
              context.area.length,
              media?.width,
              media?.height,
              media?.template,
            );
            e.atLocation(context.area.center, location)
              .stretchTo(context.area.endpoint)
              .scale({
                x: 1,
                y: (s.scale * (context.area.type === "cone"
                  ? 2 * context.area.length * Math.tan(context.area.angle * Math.PI / 360)
                  : context.area.width)) / Math.max(1, g.height),
              });
            if (context.area.type === "cone") {
              const mask = this.host.areaMask?.(context.template);
              if (mask) e.mask(mask);
            }
          } else
            e.atLocation(context.area.center, location).size({
              ...artworkSize(context.area.diameter * s.scale, media),
            });
        } else if (s.kind === "overlay") {
          e.screenSpace()
            .screenSpaceAnchor({ x: s.anchorX, y: s.anchorY })
            .screenSpacePosition({
              x: s.offsetX * (this.host.gridSize?.() ?? 100),
              y: s.offsetY * (this.host.gridSize?.() ?? 100),
            })
            .scale(s.scale);
          if (s.overlayFit) e.screenSpaceScale({ fitX: true, fitY: true });
        } else {
          e.atLocation(s.landing ?? s.destination, location);
          if (s.facing) e.rotateTowards(s.facing, { cacheLocation: true });
          // copySprite already captures mesh dimensions, texture scale and
          // mirroring. Sizing it to the footprint loses those properties.
          if (s.kind === "sprite") e.scale(s.scale);
          else
            e.size(
              artworkSize(effectFootprint(s,s.destination,grid,this.host.gridDistance?.()??5) * s.scale, media),
            );
          if (s.kind === "aura" || s.attach)
            e.attachTo(s.destination, {
              ...location,
              bindRotation: s.bindRotation,
              bindAlpha: s.bindAlpha,
            });
          if (s.maskToken) e.mask(s.destination);
        }
        applyEffectOptions(e, s);
        if (s.below) e.belowTokens();
        if (s.persist && !preview) e.persist();
      }
      return sequence;
    };
    // Prebuild every group so a bad Sequencer option cannot produce half a recipe.
    const sequences = [...groups].map(([delay, stages]) => ({
      delay,
      sequence: stages.some((s) => s.kind !== "motion" && !OPTIONAL_FX_KINDS.has(s.kind)) ? build(stages) : null,
      motions: stages.filter((s) => s.kind === "motion"),
      optionalFx: stages.filter((s) => OPTIONAL_FX_KINDS.has(s.kind)),
    }));
    this.sessions.add(session);
    try {
      const soundFiles=[...new Set(plan.filter(s=>s.kind==='sound').map(s=>s.soundFile))];
      if(soundFiles.length && this.host.preloadSounds) {
        const prepared=await this.prepare(this.host.preloadSounds(soundFiles,{preview}),session);
        if(!prepared || this.epoch!==epoch)return null;
      }
      onStart?.({ ...recipe, playbackPlan: plan });
      // Local previews never broadcast; real plays use Sequencer's own sync.
      const results = await Promise.all([
        ...sequences.map(async ({ delay, sequence, motions, optionalFx }) => {
          if (delay && !(await this.wait(delay, session))) return false;
          if (this.epoch !== epoch || failed) return false;
          await Promise.all([
            ...(sequence
              ? [(async()=>{
                  await sequence.play(preview ? { local: true } : {});
                  // Loading can finish after Stop (including locked audio).
                  // Drain only this late session, never another user's media.
                  if(this.epoch!==epoch || failed)await Promise.allSettled([
                    this.host.endEffects({name:session}),
                    this.host.endSounds?.({name:session}),
                  ]);
                })()]
              : []),
            ...motions.map((s) =>
              this.host.motion(s, context, { preview, session }),
            ),
            ...optionalFx.map(s=>this.host.optionalFx?.(s,context,{preview,session})),
          ]);
          return this.epoch===epoch && !failed;
        }),
        ...(preview
          ? [
              this.wait(
                Math.max(...plan.map((s) => s.delay + s.duration)),
                session,
              ),
            ]
          : []),
      ]);
      if (results.some((result) => !result)) return null;
      this.trace(
        preview ? "Previewed" : "Played",
        `${plan.length} effects · ${context.targets?.length ?? 0} targets`,
        recipe,
      );
      return session;
    } catch (error) {
      failed = true;
      this.cancelWaits(session);
      await Promise.allSettled([
        this.host.endEffects({ name: session }),
        this.host.endSounds?.({ name: session }),
        this.host.stopOptionalFx?.({session}),
      ]);
      throw error;
    } finally {
      if (failed || preview || !plan.some((s) => s.persist))
        this.sessions.delete(session);
    }
  }
  wait(delay, session) {
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        this.pending.delete(timer);
        resolve(true);
      }, delay);
      this.pending.set(timer, Object.assign(resolve, { session }));
    });
  }
  prepare(task,session) {
    return new Promise((resolve,reject)=>{
      const cancel=()=>{this.preparations.delete(session);resolve(false);};
      this.preparations.set(session,cancel);
      Promise.resolve(task).then(()=>{this.preparations.delete(session);resolve(true);},error=>{this.preparations.delete(session);reject(error);});
    });
  }
  cancelWaits(session = null) {
    for(const [id,cancel]of this.preparations)if(session===null||session===id)cancel();
    for (const [timer, resolve] of this.pending) {
      if (session !== null && resolve.session !== session) continue;
      clearTimeout(timer);
      this.pending.delete(timer);
      resolve(false);
    }
  }
  async stop() {
    this.epoch++;
    this.cancelWaits();
    this.clearPreviewAreas();
    await this.host.stopMotion?.();
    await this.host.stopOptionalFx?.();
    // User-scoped names keep one user's stop button from ending another's effects.
    await this.host.endEffects({ name: `${ID}-${this.host.userId()}-*` });
    await this.host.endSounds?.({ name: `${ID}-${this.host.userId()}-*` });
    this.sessions.clear();
    this.trace("Stopped", "Your Animater effects ended.");
  }
  clearPreviewAreas() {
    for (const area of this.previewAreas) area.cleanup();
    this.previewAreas.clear();
  }
}
