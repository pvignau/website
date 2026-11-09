import type { RefObject } from 'react';
import type { PlaceId } from '../content';
import { HERO } from '../engine/hero';
import type { GameMap } from '../engine/tiled';

/** Solid tiles merged into horizontal runs, to keep the SVG small. */
function solidRuns(map: GameMap): { x: number; y: number; length: number }[] {
  const { columns, rows, solid } = map.collisions;
  const runs = [];
  for (let row = 0; row < rows; row += 1) {
    let start = -1;
    for (let column = 0; column <= columns; column += 1) {
      const isSolid = column < columns && solid[row * columns + column] === 1;
      if (isSolid && start < 0) start = column;
      if (!isSolid && start >= 0) {
        runs.push({ x: start, y: row, length: column - start });
        start = -1;
      }
    }
  }
  return runs;
}

/**
 * `?debug`: solid tiles in red, interactive zones in blue (with their reach),
 * decorations in purple, spawn points in yellow, the hero hitbox in green.
 */
export function DebugOverlay({
  map,
  scale,
  hitboxRef,
}: {
  map: GameMap<PlaceId>;
  scale: number;
  hitboxRef: RefObject<SVGRectElement | null>;
}) {
  const tile = map.tileSize;
  return (
    <svg
      className="debug-overlay"
      width={map.width * scale}
      height={map.height * scale}
      viewBox={`0 0 ${map.width} ${map.height}`}
      aria-hidden="true"
    >
      {solidRuns(map).map(({ x, y, length }) => (
        <rect
          key={`${x},${y}`}
          x={x * tile}
          y={y * tile}
          width={length * tile}
          height={tile}
          fill="rgb(255 0 0 / 35%)"
        />
      ))}
      {map.interactables.map(({ id, rect, radius, name }) => (
        <g key={id}>
          <rect
            x={rect.x - radius}
            y={rect.y - radius}
            width={rect.width + radius * 2}
            height={rect.height + radius * 2}
            rx={radius}
            fill="none"
            stroke="rgb(0 120 255 / 60%)"
            strokeDasharray="4 3"
          />
          <rect
            x={rect.x}
            y={rect.y}
            width={rect.width}
            height={rect.height}
            fill="rgb(0 90 255 / 40%)"
          />
          <text x={rect.x} y={rect.y - 2} fontSize="8" fill="#fff">
            {name}
          </text>
        </g>
      ))}
      {map.decorations.map(({ id, rect }) => (
        <rect
          key={id}
          x={rect.x}
          y={rect.y}
          width={rect.width}
          height={rect.height}
          fill="rgb(180 0 255 / 50%)"
        />
      ))}
      {map.spawns.map(({ name, position }) => (
        <circle key={name} cx={position.x} cy={position.y} r="3" fill="#ffd166" />
      ))}
      <rect
        ref={hitboxRef}
        width={HERO.hitbox.width}
        height={HERO.hitbox.height}
        fill="rgb(0 255 120 / 50%)"
      />
    </svg>
  );
}
