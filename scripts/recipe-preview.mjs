import { RecipeClock, recipeFrame } from "./choreography.mjs";
import { motionPose, motionDirection, combineMotionPoses, poseTransform } from "./motion.mjs";
import {
  previewPose,
  normalizeOptions,
  easeValue,
  stageFrame,
} from "./stage-options.mjs";
import { sampleRecipe } from "./composition.mjs";
import { chainPreview } from "./chain-preview.mjs";
import { clearPreviewMediaFailure, markPreviewMediaFailure } from "./preview-media-status.mjs";
import {
  beamGeometry,
  artworkGeometry,
  effectFootprint,
  auraPreviewGrid,
  offsetInGridSquares,
} from "./media-preview.mjs";

// Editor composition uses installed media and the same motion pose function.
// Canvas preview remains the authoritative Sequencer rendering on real tokens.
export class RecipePreview {
  constructor(scene, recipe, onFrame, {tokenFx} = {}) {
    this.scene = scene;
    this.chain =
      scene.dataset.chainPreview !== undefined
        // Match the plan that generated DOM layers. A narrower inspector may
        // otherwise generate fewer area tiles and invalidate playback indices.
        ? chainPreview(recipe, { ...JSON.parse(scene.dataset.previewTokens ?? "{}"), previewWidth: Number(scene.dataset.previewWidth) || scene.clientWidth, previewHeight: Number(scene.dataset.previewHeight) || scene.clientHeight })
        : null;
    this.recipe = this.chain?.recipe ?? sampleRecipe(recipe);
    this.tokenInfo = JSON.parse(scene.dataset.previewTokens ?? "{}");
    this.onFrame = onFrame;
    this.tokenFxFactory=tokenFx;
    this.clock = new RecipeClock();
    this.videos = [...scene.querySelectorAll("video[data-preview-stage]")];
    this.images = [...scene.querySelectorAll('img[data-preview-stage]')];
    this.audio = [...scene.querySelectorAll("audio[data-preview-stage]")];
    this.layers = [...scene.querySelectorAll("[data-layer-stage]")];
    this.started = new Set();
    this.ended = new Set();
    this.abort = new AbortController();
    this.tokens = [...scene.querySelectorAll("[data-preview-token]")];
    this.grid=this.chain?.grid??55;
    const aura=recipe.lifecycle==='document'&&recipe.stages.some(s=>s.auraRadius);
    if(aura){
      this.grid=auraPreviewGrid(this.recipe,this.tokenInfo.source,scene.clientWidth||400,scene.clientHeight||300,Number(scene.dataset.previewGridDistance)||5);
    }
    if(aura||this.chain?.pathFrame){
      scene.style?.setProperty('background-size',`${this.grid}px ${this.grid}px`);
      for(const token of this.tokens){
        const chainActor=this.chain?.actors.find(a=>a.subject===token.dataset.previewToken&&(a.subject==='source'||a.targetIndex===Number(token.dataset.targetIndex??0)));
        const info=chainActor?.token??this.tokenInfo[token.dataset.previewToken],width=(info?.width??1)*this.grid,height=(info?.height??1)*this.grid;
        token.style.width=`${width}px`;token.style.height=`${height}px`;token.style.fontSize=`${this.grid*.45}px`;
        const actor=token.closest?.('.an-recipe-actor');
        if(actor){const labelWidth=Math.max(90,width);actor.style.width=`${labelWidth}px`;actor.style.marginLeft=`${-labelWidth/2}px`;actor.style.top=chainActor?`calc(${chainActor.y}% - ${height/2}px)`:`calc(45% + 27px - ${height/2}px)`;if(chainActor)actor.style.left=`${chainActor.x}%`;token.style.marginLeft=`${(labelWidth-width)/2}px`;}
        const image=token.querySelector?.('img');
        if(image){image.style.width=`${(info?.spriteWidth??info?.width??1)*this.grid}px`;image.style.height=`${(info?.spriteHeight??info?.height??1)*this.grid}px`;}
      }
    }
    if (this.chain && recipe.previewArea?.type === "cone" && !recipe.stages.some(s=>s.kind==='motion')) {
      for (const token of this.tokens) {
        const actor = this.chain.actors.find(a => a.subject === token.dataset.previewToken && (a.subject === "source" || a.targetIndex === Number(token.dataset.targetIndex ?? 0)));
        if (actor) { token.style.left = `${actor.x}%`; token.style.top = `${actor.y}%`; }
      }
    }
  }
  stateFor(element, frame) {
    if (element.dataset.previewPlan !== undefined) {
      const s = this.recipe.playbackPlan[Number(element.dataset.previewPlan)];
      const state = {
        ...stageFrame({ ...s, repeats: 1, targetStagger: 0 }, frame.time),
        stage: s,
        targetIndex: s.targetIndex,
        iteration: s.iteration,
      };
      if (this.muted?.has(s.index)) state.state = "pending";
      return state;
    }
    return frame.stages[
      Number(element.dataset.previewStage ?? element.dataset.layerStage)
    ];
  }
  // Buffer all layers before starting one shared recipe clock.
  prepare() {
    return this.mediaReady ??= Promise.all(
      [...this.videos, ...this.audio].map((video) => this.ready(video)).concat(this.images.map(image=>this.readyImage(image))),
    );
  }
  // from: start offset (ms). loop(): checked at each end to replay from 0.
  async play({ from = 0, loop } = {}) {
    await this.prepare();
    await this.prepareTokenFx();
    if (this.abort.signal.aborted) return false;
    let complete;
    do {
      // Re-entering stages mid-way must seek media to the shared clock again.
      this.started.clear();
      complete = await this.clock.play(this.recipe, (frame) => this.draw(frame), { from });
      from = 0;
    } while (complete && loop?.() && !this.abort.signal.aborted);
    return complete;
  }
  duration() { return recipeFrame(this.recipe, 0).duration; }
  // Show one still moment (timeline scrubbing): media seek but never play.
  async seek(ms) {
    await this.prepare();
    if (this.abort.signal.aborted) return;
    this.clock.stop();
    this.scrubbing = true;
    this.started.clear();
    try { this.draw(recipeFrame(this.recipe, ms)); } finally { this.scrubbing = false; }
    [...this.videos, ...this.audio].forEach((v) => v.pause());
    // A seek made while its layer was hidden is not painted once the layer
    // shows; nudge visible videos so the browser decodes that frame.
    await new Promise((resolve) => requestAnimationFrame(resolve));
    if (this.abort.signal.aborted) return;
    for (const v of this.videos)
      if (!v.closest(".an-recipe-layer")?.hidden) v.currentTime = v.currentTime + 0.001;
  }
  pause() {
    this.clock.stop();
    [...this.videos, ...this.audio].forEach((v) => v.pause());
  }
  prepareTokenFx() {
    return this.fxReady??=Promise.resolve().then(async()=>{
      if(!this.tokenFxFactory||!this.recipe.stages.some(s=>s.kind==='tokenfx'))return;
      const preview=await this.tokenFxFactory(this.scene,this.recipe);
      if(this.abort.signal.aborted){preview?.stop();return;}
      this.tokenFx=preview;await preview?.ready();
      if(this.abort.signal.aborted)preview?.stop();
    }).catch(error=>{this.tokenFx?.stop();this.tokenFx=null;this.scene.dataset.fxError=error.message;});
  }
  ready(video) {
    if (this.abort.signal.aborted) return Promise.resolve();
    if (video.readyState >= 2 && !video.error) {
      clearPreviewMediaFailure(video);
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      const finish = () => {
        clearTimeout(timer);
        video.removeEventListener("loadeddata", finish);
        video.removeEventListener("error", finish);
        this.abort.signal.removeEventListener("abort", finish);
        if (!this.abort.signal.aborted) {
          clearPreviewMediaFailure(video);
          markPreviewMediaFailure(video);
        }
        resolve();
      };
      const timer = setTimeout(finish, 5000);
      video.addEventListener("loadeddata", finish, { once: true });
      video.addEventListener("error", finish, { once: true });
      this.abort.signal.addEventListener("abort", finish, { once: true });
      video.load();
    });
  }
  readyImage(image) {
    if(this.abort.signal.aborted||image.complete&&image.naturalWidth>0)return Promise.resolve();
    return new Promise(resolve=>{
      const finish=()=>{
        clearTimeout(timer);image.removeEventListener('load',finish);image.removeEventListener('error',finish);this.abort.signal.removeEventListener('abort',finish);
        if(!this.abort.signal.aborted)image.closest('.an-recipe-layer')?.classList.toggle('is-unavailable',!image.naturalWidth);
        resolve();
      };
      const timer=setTimeout(finish,5000);
      image.addEventListener('load',finish,{once:true});image.addEventListener('error',finish,{once:true});this.abort.signal.addEventListener('abort',finish,{once:true});
    });
  }
  // Studio mute/solo: muted stages stay silent and hidden in this preview only.
  setMuted(indices) {
    this.muted = new Set(indices);
    this.started.clear();
  }
  draw(frame) {
    if (this.muted?.size)
      frame = { ...frame, stages: frame.stages.map((s) => (this.muted.has(s.index) ? { ...s, state: "pending" } : s)) };
    this.tokenFx?.draw(frame);
    for (const video of [...this.videos, ...this.audio]) {
      const index = Number(video.dataset.previewStage);
      const state = this.stateFor(video, frame);
      const layer = video.closest(".an-recipe-layer");
      const stage = state.stage ?? this.recipe.stages[index];
      const opts = normalizeOptions(stage);
      if (video.tagName !== "AUDIO") video.loop = !opts.oneShot;
      if (layer) layer.hidden = state.state !== "playing";
      const key = `${index}:${state.targetIndex}:${state.iteration}:${video.dataset.previewPlan ?? ""}`;
      const start = opts.clipStart / 1000,
        rate = video.tagName === "AUDIO" ? 1 : opts.playbackRate;
      const end = Math.min(
        opts.clipEnd ? opts.clipEnd / 1000 : Infinity,
        Number.isFinite(video.duration) ? video.duration : Infinity,
      );
      let expected = start + (state.localTime * rate) / 1000;
      if (end > start && Number.isFinite(end))
        expected = video.loop
          ? start + ((expected - start) % (end - start))
          : Math.min(expected, Math.max(start, end - 0.001));
      if (state.state === "playing" && !this.started.has(key)) {
        this.started.add(key);
        // A background/throttled frame can enter several stages late. Seek
        // each instance to its own shared-clock position, never replay from 0.
        video.currentTime = expected;
        if (video.tagName === "AUDIO") video.volume = opts.volume;
        else video.playbackRate = opts.playbackRate;
        if (!this.scrubbing) void video.play().catch((error) => {
          // A seek, stage transition or Stop can cancel pending play(). The
          // media is still valid; only resource/codec failures need a badge.
          if (error?.name === "AbortError" || this.abort.signal.aborted) return;
          if (markPreviewMediaFailure(video, error))
            this.scene.dataset.mediaError = "Asset media unavailable";
        });
      }
      if (
        state.state === "playing" &&
        Math.abs(video.currentTime - expected) > 0.15
      )
        video.currentTime = expected;
      if (
        state.state === "playing" &&
        (video.currentTime < opts.clipStart / 1000 ||
          (!opts.oneShot &&
            opts.clipEnd &&
            video.currentTime >= opts.clipEnd / 1000))
      )
        video.currentTime = opts.clipStart / 1000;
      if (
        opts.oneShot &&
        opts.clipEnd &&
        video.currentTime >= opts.clipEnd / 1000
      )
        video.pause();
      if (video.tagName === "AUDIO")
        video.volume = Math.max(
          0,
          Math.min(
            1,
            opts.volume *
              previewPose({ ...stage, opacity: 1, tracks: [] }, state.localTime)
                .alpha,
          ),
        );
      if (state.state !== "playing") {
        video.pause();
      }
    }
    for (const layer of this.layers) {
      if (!layer.dataset?.layerStage) continue;
      const index = Number(layer.dataset.layerStage),
        state = this.stateFor(layer, frame),
        stage = state.stage ?? this.recipe.stages[index];
      layer.hidden = state.state !== "playing";
      if (layer.hidden) continue;
      const s = { ...stage, ...normalizeOptions(stage) };
      let pose;
      const artwork = layer.querySelector("video,img,.an-copy-art");
      if (!artwork) continue;
      const areaLine =
        s.kind === "template" &&
        ["line", "cone"].includes(this.recipe.previewArea?.type) &&
        !s.areaTile;
      if (!["travel", "overlay"].includes(s.kind) && !areaLine) {
        const subject =
          s.kind === "projectile"
            ? s.travelOrigin === "target"
              ? "targets"
              : "source"
            : s.kind === "impact" || s.subject === "targets"
              ? "targets"
              : "source";
        const actor = this.chain?.actors.find(
          (a) =>
            a.id ===
            (s.kind === "projectile" ? s.origin?.id : s.destination?.id),
        );
        const info = actor?.token ?? this.tokenInfo[subject];
        if (actor && s.kind !== "projectile") { layer.style.left = `${actor.x}%`; layer.style.top = `${actor.y}%`; }
        let geometry;
        if (s.kind === "sprite") {
          geometry = {
            width: (info?.spriteWidth ?? info?.width ?? 1) * this.grid,
            height: (info?.spriteHeight ?? info?.height ?? 1) * this.grid,
          };
        } else {
          const area = this.recipe.previewArea;
          const gridDistance =
            Number(this.scene.dataset.previewGridDistance) || 5;
          const size = s.areaTile
            ? s.areaTile.width
            : s.kind === "template"
              ? ((area?.value ?? 15) / gridDistance) *
                (["square", "cube", "rect"].includes(area?.type) ? 1 : 2) *
                this.grid
              : effectFootprint(s,info,this.grid,gridDistance);
          geometry = artworkGeometry(
            size,
            artwork.videoWidth || artwork.naturalWidth || layer.dataset.mediaWidth,
            artwork.videoHeight || artwork.naturalHeight || layer.dataset.mediaHeight,
            { file: artwork.currentSrc || artwork.getAttribute?.("src"), width: artwork.videoWidth || artwork.naturalWidth || layer.dataset.mediaWidth, height: artwork.videoHeight || artwork.naturalHeight || layer.dataset.mediaHeight },
          );
        }
        layer.style.width = `${geometry.width}px`;
        layer.style.height = `${geometry.height}px`;
        artwork.style.objectFit = "fill";
      }
      const offsetActor=this.chain?.actors.find(a=>a.id===(s.kind==='projectile'?s.origin?.id:s.destination?.id));
      const offsetInfo=offsetActor?.token??this.tokenInfo[s.kind==='impact'||s.subject==='targets'?'targets':'source'];
      const offsets=offsetInGridSquares(s,offsetInfo,this.grid);
      pose = previewPose({...s,offsetX:offsets.x,offsetY:offsets.y}, state.localTime, this.grid, {
        width: parseFloat(layer.style.width) || 115,
        height: parseFloat(layer.style.height) || 115,
      });
      if (s.areaTile) {
        layer.style.left = `${s.areaTile.center.x / (this.chain?.width ?? 400) * 100}%`;
        layer.style.top = `${s.areaTile.center.y / (this.chain?.height ?? 300) * 100}%`;
      }
      if (s.kind === "travel" || areaLine) {
        const reverse = s.travelOrigin === "target";
        const from = areaLine
            ? (this.chain?.actors[0] ?? { x: 24, y: 45 })
            : s.areaFan && this.chain
            ? { x: s.origin.x / this.chain.width * 100, y: s.origin.y / this.chain.height * 100 }
            : this.chain
            ? this.chain.actors.find((a) => a.id === layer.dataset.previewFrom)
            : { x: reverse ? 76 : 24, y: 45 },
          to = areaLine
            ? (this.chain?.actors[1] ?? { x: 90, y: 45 })
            : s.areaFan && this.chain
              ? { x: s.endpoint.x / this.chain.width * 100, y: s.endpoint.y / this.chain.height * 100 }
              : this.chain
              ? this.chain.actors.find((a) => a.id === layer.dataset.previewTo)
              : { x: reverse ? 24 : 76, y: 45 };
        const dx = ((to.x - from.x) * (this.scene.clientWidth || 400)) / 100,
          dy = ((to.y - from.y) * (this.scene.clientHeight || 300)) / 100;
        const g = beamGeometry(
          Math.hypot(dx, dy),
          artwork.videoWidth || artwork.naturalWidth || Number(layer.dataset.mediaWidth),
          artwork.videoHeight || artwork.naturalHeight || Number(layer.dataset.mediaHeight),
          JSON.parse(layer.dataset.previewTemplate || "null"),
        );
        layer.style.left = `${from.x}%`;
        layer.style.top = this.chain ? `${from.y}%` : `calc(${from.y}% + 27px)`;
        layer.style.width = `${g.width}px`;
        layer.style.height = `${g.height}px`;
        layer.style.transformOrigin = `${g.start}px 50%`;
        layer.style.transform = `translate(-${g.start}px, -50%) rotate(${Math.atan2(dy, dx)}rad)`;
        artwork.style.objectFit = "fill";
        pose.scaleX /= s.scale || 1;
        if (areaLine) {
          const width = this.recipe.previewArea?.type === "cone" ? 2 * Math.hypot(dx, dy) : this.grid;
          pose.scaleY *= width / Math.max(1, g.height);
        }
      }
      if (s.kind === "projectile") {
        const p = easeValue(
          (state.localTime - s.moveDelay) / (s.duration - s.moveDelay),
          s.moveEase,
        );
        if (this.chain) {
          const from = s.areaFan ? { x: s.origin.x / this.chain.width * 100, y: s.origin.y / this.chain.height * 100 } : this.chain.actors.find((a) => a.id === s.origin.id),
            to = s.areaFan ? { x: s.endpoint.x / this.chain.width * 100, y: s.endpoint.y / this.chain.height * 100 } : this.chain.actors.find((a) => a.id === s.endpoint.id);
          layer.style.left = `${from.x + (to.x - from.x) * p}%`;
          layer.style.top = `${from.y + (to.y - from.y) * p}%`;
        } else
          layer.style.left = `${s.travelOrigin === "target" ? 76 - 52 * p : 24 + 52 * p}%`;
      }
      if (
        s.kind === "aura" ||
        (s.attach &&
          !["travel", "projectile", "template", "overlay"].includes(s.kind))
      ) {
        const motion = this.subjectPose(
          s.kind === "impact" ? "targets" : (s.subject ?? "source"),
          frame,
          s.targetIndex,
        );
        pose.x += motion.x;
        pose.y += motion.y;
        if (s.bindRotation) pose.rotation += (motion.rotation * 180) / Math.PI;
      }
      if (s.kind === "sprite" && !this.chain)
        pose.x +=
          (Number(layer.dataset.copy) - (s.copies - 1) / 2) * s.copySpread * 55;
      layer.style.setProperty("--stage-scale", "1");
      layer.style.opacity = pose.alpha;
      layer.style.zIndex = s.below ? 1 : 3 + s.zIndex;
      if (s.kind === "overlay") {
        layer.style.left = `${s.anchorX * 100}%`;
        layer.style.top = `${s.anchorY * 100}%`;
      }
      artwork.style.transformOrigin = `${s.anchorX * 100}% ${s.anchorY * 100}%`;
      // The point selected as anchor must land on the token, not merely become
      // the rotation pivot. Layer itself is centered by workspace CSS.
      if (
        s.customAnchor &&
        !["travel", "projectile", "template", "overlay"].includes(s.kind)
      ) {
        pose.x += (0.5 - s.anchorX) * (parseFloat(layer.style.width) || 115);
        pose.y += (0.5 - s.anchorY) * (parseFloat(layer.style.height) || 115);
      }
      if (s.kind === "sprite") {
        const info =
          this.chain?.actors.find((a) => a.id === s.destination?.id)?.token ??
          this.tokenInfo[s.subject ?? "source"];
        // Sequencer's explicit mirror option preserves a mirrored source;
        // multiplying two negatives would incorrectly unmirror the copy.
        if (Number(info?.textureScaleX) < 0)
          pose.scaleX = -Math.abs(pose.scaleX);
        if (Number(info?.textureScaleY) < 0)
          pose.scaleY = -Math.abs(pose.scaleY);
        pose.rotation += Number(info?.rotation) || 0;
        const image = artwork.querySelector?.("img");
        if (image) image.style.objectFit = "fill";
      }
      artwork.style.transform = `translate(${pose.x}px,${pose.y}px) rotate(${pose.rotation}deg) scale(${pose.scaleX},${pose.scaleY})`;
      artwork.style.filter = `${s.tintEnabled && layer.dataset.tintFilter ? `${s.colorize?'grayscale(1) ':''}url(#${layer.dataset.tintFilter}) ` : ""}brightness(${s.kind === "sprite" && s.shadow ? 0 : s.brightness}) contrast(${1 + s.contrast}) saturate(${1 + s.saturation}) hue-rotate(${s.hue}deg) blur(${s.blur}px)${s.glow ? ` drop-shadow(0 0 ${s.glow * 2}px ${s.glowColor})` : ""}`;
      artwork.style.clipPath =
        s.maskToken &&
        !["travel", "projectile", "template", "overlay"].includes(s.kind)
          ? "circle(28px at center)"
          : "";
    }
    // Same recipe gestures compose on one baseline, matching canvas playback.
    for (const token of this.tokens) {
      const subject = token.dataset.previewToken;
      const pose = this.subjectPose(
        subject,
        frame,
        Number(token.dataset.targetIndex ?? 0),
      );
      token.style.transform = poseTransform(pose);
      token.style.opacity = pose.alpha ?? "";
    }
    this.onFrame(frame);
  }
  subjectPose(subject, frame, targetIndex = 0) {
    if (this.chain) {
      const stages = this.recipe.playbackPlan
        .filter(
          (s) =>
            s.kind === "motion" &&
            s.subject === subject &&
            (subject === "source" || s.targetIndex === targetIndex) &&
            frame.time >= s.delay,
        );
      return combineMotionPoses(stages.map(stage => {
      const state = stageFrame(
        { ...stage, repeats: 1, targetStagger: 0 },
        frame.time,
      );
      const actor = this.chain.actors.find(
        (a) => a.id === stage.destination.id,
      );
      const place = (a) => ({
        ...a,
        center: {
          x: (a.x * (this.scene.clientWidth || 400)) / 100,
          y: (a.y * (this.scene.clientHeight || 300)) / 100,
        },
        w: (a.token?.width ?? 1) * (this.grid??55),
        h: (a.token?.height ?? 1) * (this.grid??55),
      });
      const target =
        this.chain.actors.find((a) => a.id === stage.motionTarget?.id) ??
        this.chain.actors[targetIndex + 1];
      const direction = motionDirection(
        place(actor),
        place(this.chain.actors[0]),
        place(target),
        stage.motion,
        this.grid??55,
      );
      return state.state === "playing"
        ? motionPose(stage, state.progress, direction, this.grid??55)
        : { x: 0, y: 0, rotation: 0, scale: 1 };
      }));
    }
    const place = (subject, x) => ({
      id: subject,
      center: {
        x: x * (this.scene.clientWidth || 400),
        y: 0.45 * (this.scene.clientHeight || 300),
      },
      w: (this.tokenInfo[subject]?.width ?? 1) * 55,
      h: (this.tokenInfo[subject]?.height ?? 1) * 55,
    });
    const source = place("source", 0.24),
      target = place("targets", 0.76);
    return combineMotionPoses(this.recipe.stages.flatMap((stage, index) => {
      const state = frame.stages[index];
      if (stage.kind !== "motion" || stage.subject !== subject || state.state !== "playing") return [];
      const direction = motionDirection(
      subject === "source" ? source : target,
      source,
      target,
      stage.motion,
      55,
    );
      return [motionPose(stage, state.progress, direction, 55)];
    }));
  }
  stop() {
    this.abort.abort();
    this.clock.stop();
    this.tokenFx?.stop();
    [...this.videos, ...this.audio].forEach((v) => v.pause());
    this.tokens.forEach((t) => {
      t.style.transform = "";
    });
    this.scene.querySelectorAll(".an-recipe-layer").forEach((e) => {
      e.hidden = true;
    });
  }
}
