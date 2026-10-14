// Displacement: where a token ends up when an animation moves it for real (finishers now,
// forced movement later), and the one document write that puts it there. Pure: Foundry
// supplies walls, scene bounds, grid snapping and the write through injected functions.

// Straight out from the attacker, through the target.
export function awayFrom(attacker, target) {
  if (!attacker || !target) return null;
  const x = target.x - attacker.x, y = target.y - attacker.y, length = Math.hypot(x, y);
  return length ? { x: x / length, y: y / length } : null;
}

const gridSnap = (grid) => (p) => ({ x: Math.round(p.x / grid) * grid, y: Math.round(p.y / grid) * grid });

// Top-left positions one square apart along the direction. Squares count like grid
// movement: the longer axis advances one whole square per step, so diagonals do not stall.
export function landingSteps(from, direction, squares, grid, snap = gridSnap(grid)) {
  const lead = Math.max(Math.abs(direction?.x ?? 0), Math.abs(direction?.y ?? 0));
  if (!lead || !(squares > 0)) return [];
  const sx = direction.x / lead, sy = direction.y / lead, steps = [];
  for (let i = 1; i <= Math.round(squares); i++) {
    const step = snap({ x: from.x + sx * grid * i, y: from.y + sy * grid * i });
    const last = steps.at(-1) ?? from;
    if (step.x !== last.x || step.y !== last.y) steps.push(step);
  }
  return steps;
}

const centerOf = (p, size) => ({ x: p.x + size.w / 2, y: p.y + size.h / 2 });
const inside = (p, size, b) => !b || (p.x >= b.x && p.y >= b.y && p.x + size.w <= b.x + b.width && p.y + size.h <= b.y + b.height);

// The farthest step reached without crossing a wall or leaving the scene.
export function landingSpot({ from, direction, squares, grid, size, collides = () => false, bounds = null, snap }) {
  let spot = { x: from.x, y: from.y };
  for (const step of landingSteps(from, direction, squares, grid, snap)) {
    if (!inside(step, size, bounds) || collides(centerOf(spot, size), centerOf(step, size))) break;
    spot = step;
  }
  return spot;
}
