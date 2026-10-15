// Draws token fragments on each client: pieces of the token's own texture placed where the
// token's art is drawn, moved by fragmentPose, destroyed at the end. Halves and shards are
// masked sprites; dust specks are cropped sub-textures (no masks, so dozens stay cheap).
import { fragmentPieces, fragmentFlight, fragmentPose } from "./fragments.mjs";

export function createFragmentRenderer({ PIXI, grid }) {
  return {
    // `base` is the mesh's un-posed transform ({ x, y, rotation, sx, sy }); without it the live mesh is used.
    start(token, stage, cutAngle, base) {
      const mesh = token?.mesh, texture = mesh?.texture;
      if (!texture || !(token.center || mesh.position)) return null;
      const layer = mesh.parent ?? globalThis.canvas?.primary, g = grid();
      const sx = base?.sx ?? mesh.scale?.x ?? 1, sy = base?.sy ?? mesh.scale?.y ?? 1;
      const flipX = Math.sign(sx || 1), flipY = Math.sign(sy || 1), turn = base?.rotation ?? mesh.rotation ?? 0;
      // Displayed art size, un-posed: the mesh's own size rescaled from its live scale to the base scale.
      const live = (size, now, was, fallback) => {
        const s = Math.abs(size ?? 0);
        if (!s) return fallback;
        return now && was ? (s * Math.abs(was)) / Math.abs(now) : s;
      };
      const w = live(mesh.width, mesh.scale?.x, sx, token.w), h = live(mesh.height, mesh.scale?.y, sy, token.h);
      const rot = (dx, dy) => ({ x: Math.cos(turn) * dx - Math.sin(turn) * dy, y: Math.sin(turn) * dx + Math.cos(turn) * dy });
      // The mesh position sits at the anchor; the art's centre is offset from it.
      const pos = mesh.position ? { x: base?.x ?? mesh.position.x, y: base?.y ?? mesh.position.y } : null;
      const off = pos ? rot((0.5 - (mesh.anchor?.x ?? 0.5)) * w * flipX, (0.5 - (mesh.anchor?.y ?? 0.5)) * h * flipY) : { x: 0, y: 0 };
      const centre = pos ? { x: pos.x + off.x, y: pos.y + off.y } : token.center;
      const place = (dx, dy) => { const r = rot(dx, dy); return { x: centre.x + r.x, y: centre.y + r.y }; };
      const sorting = { elevation: mesh.elevation ?? token.document?.elevation, sortLayer: mesh.sortLayer, sort: mesh.sort };
      const boxes = [], crops = [];
      let parts;
      try {
        parts = fragmentPieces(stage, cutAngle).map((piece, i) => {
          const box = new PIXI.Container(), cx = piece.centroid.x * w, cy = piece.centroid.y * h;
          boxes.push(box);
          let crop = null, sprite;
          if (piece.rect && texture.baseTexture && texture.frame) {
            const f = texture.frame, rx = flipX < 0 ? -piece.rect.x - piece.rect.w : piece.rect.x, ry = flipY < 0 ? -piece.rect.y - piece.rect.h : piece.rect.y;
            // Whole pixels inside the frame: PIXI throws when a crop overflows the base texture.
            const fx = Math.min(f.x + f.width - 1, Math.max(f.x, Math.floor(f.x + (rx + 0.5) * f.width)));
            const fy = Math.min(f.y + f.height - 1, Math.max(f.y, Math.floor(f.y + (ry + 0.5) * f.height)));
            const fw = Math.max(1, Math.min(Math.ceil(piece.rect.w * f.width), f.x + f.width - fx));
            const fh = Math.max(1, Math.min(Math.ceil(piece.rect.h * f.height), f.y + f.height - fy));
            crop = new PIXI.Texture(texture.baseTexture, new PIXI.Rectangle(fx, fy, fw, fh));
            crops.push(crop);
            sprite = new PIXI.Sprite(crop); sprite.anchor.set(0.5); sprite.width = piece.rect.w * w * flipX; sprite.height = piece.rect.h * h * flipY;
          } else {
            sprite = new PIXI.Sprite(texture); sprite.anchor.set(0.5); sprite.width = w * flipX; sprite.height = h * flipY; sprite.position.set(-cx, -cy);
            const mask = new PIXI.Graphics().beginFill(0xffffff).drawPolygon(piece.polygon.flatMap((p) => [p.x * w - cx, p.y * h - cy])).endFill();
            box.addChild(mask); sprite.mask = mask;
          }
          box.addChild(sprite);
          const start = place(cx, cy); box.position.set(start.x, start.y); box.rotation = turn;
          // Foundry sorts by elevation, sortLayer, sort, then zIndex: match the token so pieces sit with it.
          for (const [key, value] of Object.entries(sorting)) if (value !== undefined) box[key] = value;
          if (mesh.zIndex !== undefined) box.zIndex = mesh.zIndex + 1;
          layer.addChild(box);
          return { box, crop, piece, flight: fragmentFlight(stage, piece, i, cutAngle), cx, cy };
        });
      } catch (error) {
        for (const box of boxes) { try { box.destroy({ children: true }); } catch { /* keep cleaning */ } }
        for (const crop of crops) { try { crop.destroy(false); } catch { /* keep cleaning */ } }
        throw error;
      }
      return {
        update(p) {
          for (const part of parts) {
            const pose = fragmentPose(stage, part.piece, part.flight, p), at = place(part.cx + pose.x * g, part.cy + pose.y * g);
            part.box.position.set(at.x, at.y); part.box.rotation = turn + (pose.rotation * Math.PI) / 180; part.box.alpha = pose.alpha;
          }
        },
        destroy() { for (const part of parts) { part.box.destroy({ children: true }); part.crop?.destroy(false); } },
      };
    },
  };
}
