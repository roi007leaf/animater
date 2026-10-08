import { MOTIONS } from "./model.mjs";
import { shakeCycles, settledProgress } from "./motion-pacing.mjs";
import { PATH_MOTIONS, motionPhases, pathDistance } from "./motion-path.mjs";
// Pure pose function shared by canvas playback and the editor's motion preview.
export function motionPose(
  stage,
  progress,
  direction = { x: 1, y: 0 },
  grid = 100,
) {
  const p = Math.min(1, Math.max(0, progress));
  const envelope = Math.sin(Math.PI * p) ** 2;
  const amount = stage.intensity ?? 1;
  const distance = (stage.distance ?? 0.35) * grid * amount;
  const pose = { x: 0, y: 0, rotation: 0, scale: 1 };
  if (p === 0 || p === 1) return pose;
  if (PATH_MOTIONS.has(stage.motion)) {
    const heading = stage.motionHeading;
    direction = heading === "away" ? { ...direction, x: -direction.x, y: -direction.y }
      : heading === "up" ? { ...direction, x: 0, y: -1 }
      : heading === "down" ? { ...direction, x: 0, y: 1 }
      : heading === "left" ? { ...direction, x: -1, y: 0 }
      : heading === "right" ? { ...direction, x: 1, y: 0 }
      : direction;
    const { arrival, release } = motionPhases(stage);
    const out = settledProgress(Math.min(1, p / arrival));
    const back = settledProgress(Math.max(0, (p - release) / (1 - release)));
    const travel = pathDistance(stage, direction, grid) * out * (1 - back);
    const side = stage.motionSide ?? 1;
    if (stage.motion === "dodge") {
      pose.x = -direction.y * travel * side;
      pose.y = direction.x * travel * side;
      pose.rotation = side * 0.18 * amount * Math.sin(Math.PI * p);
      pose.scale = 1 - 0.08 * amount * envelope;
    } else {
      pose.x = direction.x * travel;
      pose.y = direction.y * travel;
      if (stage.motion === "rush") {
        pose.rotation =
          direction.x *
          0.15 *
          amount *
          Math.sin(Math.PI * Math.min(1, p / arrival));
      } else if (stage.motion === "leap") {
        const height = (stage.jumpHeight ?? 0.8) * grid;
        const lift = (stage.arrivalLift ?? 0) * grid;
        const landing =
          p <= arrival
            ? 1
            : 1 -
              settledProgress(
                Math.min(1, (p - arrival) / ((release - arrival) * 0.65)),
              );
        pose.y -=
          (4 * out * (1 - out) * height + out * lift * landing) * (1 - back);
      } else if (stage.motion === "roll") {
        pose.rotation = Math.PI * 2 * out * side;
        pose.scale = 1 - 0.12 * amount * Math.sin(Math.PI * out);
      }
    }
    return pose;
  }
  switch (stage.motion) {
    case "lunge":
    case "recoil":
      pose.x = direction.x * distance * envelope;
      pose.y = direction.y * distance * envelope;
      break;
    case "shake":
      pose.x =
        Math.sin(p * Math.PI * 2 * shakeCycles(stage)) *
        distance *
        0.3 *
        envelope;
      pose.rotation =
        Math.sin(p * Math.PI * 2 * Math.min(4, shakeCycles(stage))) *
        0.06 *
        amount *
        envelope;
      break;
    case "spin":
      // Only complete turns can settle back to the original visual angle.
      // Fractional intensity previously snapped to baseline on the last frame.
      pose.rotation =
        Math.PI * 2 * settledProgress(p) * Math.max(1, Math.round(amount));
      break;
    case "levitate":
      pose.y = -distance * envelope;
      break;
    case "pulse":
      pose.scale = 1 + 0.18 * amount * envelope;
      break;
    // Squash/stretch and opacity channels (scaleX/scaleY/alpha) are only set
    // by these gestures, so older poses keep their original shape.
    case "press":
      pose.y = distance * 0.25 * envelope;
      pose.scaleX = 1 + 0.12 * amount * envelope;
      pose.scaleY = 1 - 0.2 * amount * envelope;
      break;
    case "sink":
      pose.y = distance * envelope;
      pose.scaleY = 1 - 0.15 * amount * envelope;
      pose.alpha = 1 - 0.65 * envelope;
      break;
    case "flicker": {
      const cycles = Math.max(2, Math.round(3 * amount));
      pose.alpha = 1 - 0.75 * envelope * (0.5 - 0.5 * Math.cos(p * Math.PI * 2 * cycles));
      break;
    }
    case "throw": {
      // Draw back for the first third, then snap forward past the start.
      const reach = p < 0.35 ? -0.45 * Math.sin((Math.PI * p) / 0.35) : Math.sin((Math.PI * (p - 0.35)) / 0.65);
      pose.x = direction.x * distance * reach;
      pose.y = direction.y * distance * reach;
      pose.rotation = 0.12 * amount * reach * Math.sign(direction.x || 1);
      break;
    }
    case "brace":
      pose.x = -direction.x * distance * 0.4 * envelope;
      pose.y = -direction.y * distance * 0.4 * envelope;
      pose.scaleX = 1 + 0.05 * amount * envelope;
      pose.scaleY = 1 - 0.08 * amount * envelope;
      break;
    case "stagger": {
      const side = stage.motionSide ?? 1;
      pose.x = -direction.x * distance * 0.6 * envelope;
      pose.y = -direction.y * distance * 0.6 * envelope + distance * 0.15 * envelope;
      pose.rotation = side * 0.28 * amount * Math.sin(Math.PI * p) * (1 - p);
      break;
    }
    case "cower":
      pose.scale = 1 - 0.12 * amount * envelope;
      pose.x = Math.sin(p * Math.PI * 2 * 6) * distance * 0.08 * envelope;
      pose.y = distance * 0.1 * envelope;
      break;
    case "slam": {
      // Rise for 60%, then a fast fall and a brief squash on landing.
      const rise = p < 0.6 ? Math.sin((Math.PI / 2) * (p / 0.6)) : Math.max(0, 1 - (p - 0.6) / 0.12);
      pose.y = -distance * 1.2 * rise;
      const impact = p >= 0.72 ? Math.sin((Math.PI * (p - 0.72)) / 0.28) : 0;
      pose.scaleX = 1 + 0.12 * amount * impact;
      pose.scaleY = 1 - 0.15 * amount * impact;
      break;
    }
    case "drift":
      pose.y = distance * 0.35 * envelope;
      pose.x = Math.sin(p * Math.PI * 3) * distance * 0.25 * envelope;
      pose.rotation = Math.sin(p * Math.PI * 3) * 0.08 * amount * envelope;
      break;
  }
  return pose;
}
export function motionDirection(token, source, target, motion, grid = 100) {
  const other =
    token === source || (token?.id && token.id === source?.id)
      ? target
      : source;
  const a = motion === "recoil" ? other?.center : token?.center;
  const b = motion === "recoil" ? token?.center : other?.center;
  const x = (b?.x ?? 1) - (a?.x ?? 0),
    y = (b?.y ?? 0) - (a?.y ?? 0);
  const length = Math.hypot(x, y);
  const vector =
    length && (!PATH_MOTIONS.has(motion) || (a && b))
      ? { x: x / length, y: y / length }
      : { x: 1, y: 0 };
  if (!PATH_MOTIONS.has(motion)) return vector;
  // Intersect the combined footprints, including unequal rectangular tokens.
  const width =
    ((token?.w ?? (token?.document?.width ?? 1) * grid) +
      (other?.w ?? (other?.document?.width ?? 1) * grid)) /
    2;
  const height =
    ((token?.h ?? (token?.document?.height ?? 1) * grid) +
      (other?.h ?? (other?.document?.height ?? 1) * grid)) /
    2;
  const clearance = Math.min(
    Math.abs(vector.x) > 0.001 ? width / Math.abs(vector.x) : Infinity,
    Math.abs(vector.y) > 0.001 ? height / Math.abs(vector.y) : Infinity,
  );
  return {
    ...vector,
    length: other?.center && token?.center ? length : 0,
    clearance,
  };
}

// Independently authored gestures can overlap: a wind-up may continue while a
// lunge starts. Compose their local deltas against one unanimated baseline.
export function combineMotionPoses(poses) {
  const combined = poses.reduce((pose, next) => ({
    x: pose.x + next.x,
    y: pose.y + next.y,
    rotation: pose.rotation + next.rotation,
    scale: pose.scale * next.scale,
  }), { x: 0, y: 0, rotation: 0, scale: 1 });
  // Optional channels appear only when a gesture uses them.
  for (const key of ["scaleX", "scaleY", "alpha"])
    if (poses.some(p => p[key] !== undefined)) combined[key] = poses.reduce((v, p) => v * (p[key] ?? 1), 1);
  return combined;
}
// CSS transform for editor/preview tokens, including squash and stretch.
export const poseTransform = pose =>
  `translate(${pose.x}px,${pose.y}px) rotate(${pose.rotation}rad) scale(${pose.scaleX === undefined && pose.scaleY === undefined ? pose.scale : `${pose.scale * (pose.scaleX ?? 1)},${pose.scale * (pose.scaleY ?? 1)}`})`;

const tokenGeometry = token => ({
  width: token.document?.width,
  height: token.document?.height,
  sx: token.document?.texture?.scaleX,
  sy: token.document?.texture?.scaleY,
  src: token.document?.texture?.src,
});
const geometryChanged = (token, initial) =>
  Object.entries(initial).some(([key, value]) => tokenGeometry(token)[key] !== value);
// Animate the existing rendered token mesh. Never write TokenDocument fields.
// Every client runs this renderer locally; previews bypass the module socket.
export class TokenMotionPlayer {
  constructor({
    frame = (callback) => globalThis.requestAnimationFrame(callback),
    cancel = (handle) => globalThis.cancelAnimationFrame(handle),
    now = () => performance.now(),
    grid = () => 100,
  } = {}) {
    this.frame = frame;
    this.cancel = cancel;
    this.now = now;
    this.grid = grid;
    this.active = new Map();
  }
  play(token, stage, direction, owner, { target } = {}) {
    if (
      !MOTIONS[stage.motion] ||
      !token?.mesh ||
      token.visible === false ||
      token.document?.hidden
    )
      return Promise.resolve(false);
    const current = this.active.get(token);
    if (current && (current.owner !== owner || current.mesh !== token.mesh)) this.end(token);
    const existing = this.active.get(token);
    const mesh = token.mesh;
    const original = existing?.original ?? {
      x: mesh.position.x,
      y: mesh.position.y,
      rotation: mesh.rotation,
      sx: mesh.scale.x,
      sy: mesh.scale.y,
      alpha: mesh.alpha ?? 1,
    };
    const location = existing?.location ?? {
      x: token.document?.x,
      y: token.document?.y,
      rotation: token.document?.rotation,
      geometry: tokenGeometry(token),
    };
    const endpoint =
      PATH_MOTIONS.has(stage.motion) && stage.motionRange === "target" && target
        ? { x: target.document?.x, y: target.document?.y, geometry: tokenGeometry(target) }
        : null;
    return new Promise((resolve) => {
      const run = existing ?? { owner, mesh, original, location, tracks: [], frame: null };
      run.tracks.push({ stage, direction, target, endpoint, resolve, start: this.now() });
      if (existing) return;
      this.active.set(token, run);
      const tick = (time) => {
        if (this.active.get(token) !== run) return;
        const moved =
          token.document?.x !== location.x || token.document?.y !== location.y;
        const rotated = token.document?.rotation !== location.rotation;
        const resized = geometryChanged(token, location.geometry);
        if (
          mesh.destroyed ||
          token.mesh !== mesh ||
          moved ||
          rotated ||
          resized ||
          token.visible === false ||
          token.document?.hidden ||
          run.tracks.some(({ target, endpoint }) => endpoint &&
            (target.destroyed ||
              target.visible === false ||
              target.document?.hidden ||
              target.document?.x !== endpoint.x ||
              target.document?.y !== endpoint.y ||
              geometryChanged(target, endpoint.geometry)))
        ) {
          this.end(token, !moved && !resized, !rotated, !resized);
          return;
        }
        const poses = [];
        run.tracks = run.tracks.filter(track => {
          const progress = Math.min(1, (time - track.start) / track.stage.duration);
          if (progress >= 1) {
            track.resolve(true);
            return false;
          }
          poses.push(motionPose(track.stage, progress, track.direction, this.grid()));
          return true;
        });
        const pose = combineMotionPoses(poses);
        mesh.position.set(original.x + pose.x, original.y + pose.y);
        mesh.rotation = original.rotation + pose.rotation;
        mesh.scale.set(original.sx * pose.scale * (pose.scaleX ?? 1), original.sy * pose.scale * (pose.scaleY ?? 1));
        if (pose.alpha !== undefined) { mesh.alpha = original.alpha * pose.alpha; run.alphaTouched = true; }
        else if (run.alphaTouched) mesh.alpha = original.alpha;
        if (!run.tracks.length) this.end(token);
        else run.frame = this.frame(tick);
      };
      run.frame = this.frame(tick);
    });
  }
  end(token, restorePosition = true, restoreRotation = true, restoreScale = true) {
    const run = this.active.get(token);
    if (!run) return;
    this.active.delete(token);
    this.cancel(run.frame);
    if (!run.mesh.destroyed && token.mesh === run.mesh) {
      if (restorePosition)
        run.mesh.position.set(run.original.x, run.original.y);
      if (restoreRotation) run.mesh.rotation = run.original.rotation;
      if (restoreScale) run.mesh.scale.set(run.original.sx, run.original.sy);
      if (run.alphaTouched) run.mesh.alpha = run.original.alpha;
    }
    for (const track of run.tracks) track.resolve(true);
  }
  stop(owner, { prefix = false } = {}) {
    for (const [token, run] of this.active)
      if (!owner || run.owner === owner || (prefix && typeof run.owner === "string" && run.owner.startsWith(`${owner}:`))) this.end(token);
  }
}
