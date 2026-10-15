// Draws token fragments on each client: pieces of the token's own texture placed where the
// token stands, moved by fragmentPose, destroyed at the end. Halves and shards are masked
// sprites; dust specks are cropped sub-textures (no masks, so dozens stay cheap).
import { fragmentPieces, fragmentFlight, fragmentPose } from "./fragments.mjs";

export function createFragmentRenderer({ PIXI, grid }) {
  return {
    start(token, stage, cutAngle) {
      const mesh = token?.mesh, texture = mesh?.texture;
      if (!texture || !token.center) return null;
      const layer = mesh.parent ?? globalThis.canvas?.primary, w = token.w, h = token.h, g = grid();
      const flipX = Math.sign(mesh.scale?.x || 1), flipY = Math.sign(mesh.scale?.y || 1), turn = mesh.rotation ?? 0;
      const place = (dx, dy) => ({ x: token.center.x + Math.cos(turn) * dx - Math.sin(turn) * dy, y: token.center.y + Math.sin(turn) * dx + Math.cos(turn) * dy });
      const parts = fragmentPieces(stage, cutAngle).map((piece, i) => {
        const box = new PIXI.Container(), cx = piece.centroid.x * w, cy = piece.centroid.y * h;
        let crop = null, sprite;
        if (piece.rect && texture.baseTexture && texture.frame) {
          const f = texture.frame, rx = flipX < 0 ? -piece.rect.x - piece.rect.w : piece.rect.x, ry = flipY < 0 ? -piece.rect.y - piece.rect.h : piece.rect.y;
          crop = new PIXI.Texture(texture.baseTexture, new PIXI.Rectangle(f.x + (rx + 0.5) * f.width, f.y + (ry + 0.5) * f.height, piece.rect.w * f.width, piece.rect.h * f.height));
          sprite = new PIXI.Sprite(crop); sprite.anchor.set(0.5); sprite.width = piece.rect.w * w * flipX; sprite.height = piece.rect.h * h * flipY;
        } else {
          sprite = new PIXI.Sprite(texture); sprite.anchor.set(0.5); sprite.width = w * flipX; sprite.height = h * flipY; sprite.position.set(-cx, -cy);
          const mask = new PIXI.Graphics().beginFill(0xffffff).drawPolygon(piece.polygon.flatMap((p) => [p.x * w - cx, p.y * h - cy])).endFill();
          box.addChild(mask); sprite.mask = mask;
        }
        box.addChild(sprite);
        const start = place(cx, cy); box.position.set(start.x, start.y); box.rotation = turn;
        if (mesh.zIndex !== undefined) box.zIndex = mesh.zIndex + 1;
        layer.addChild(box);
        return { box, crop, piece, flight: fragmentFlight(stage, piece, i, cutAngle), cx, cy };
      });
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
