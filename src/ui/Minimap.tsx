import type { RefObject } from 'react';
import { useEffect, useRef } from 'react';
import type { PlaceId } from '../content';
import type { Rect, Size } from '../engine/geometry';
import type { MinimapLayout } from '../engine/minimap';
import { minimapScale, spreadMarkers } from '../engine/minimap';
import { drawMinimap } from './drawMinimap';
import './Minimap.css';

/** Width of a place marker, in CSS pixels (Minimap.css), and the room kept between two. */
const MARKER_SIZE = 10;
const MARKER_GAP = 2;

/** Runs `callback` when the browser has a moment, or soon; returns a way to cancel it. */
function whenIdle(callback: () => void): () => void {
  if (typeof window.requestIdleCallback === 'function') {
    const handle = window.requestIdleCallback(callback, { timeout: 1000 });
    return () => {
      window.cancelIdleCallback(handle);
    };
  }
  const handle = window.setTimeout(callback, 50);
  return () => {
    window.clearTimeout(handle);
  };
}

function decoded(image: HTMLImageElement): Promise<void> {
  if (typeof image.decode === 'function') return image.decode();
  return new Promise((resolve, reject) => {
    image.addEventListener('load', () => {
      resolve();
    });
    image.addEventListener('error', reject);
  });
}

interface MinimapProps {
  layout: MinimapLayout<PlaceId>;
  /** The background image of the map, and where it lies on the map. */
  image: string;
  background: Rect;
  /** The background is decoded: the minimap draws from it, once, when the browser has time. */
  ready: boolean;
  visited: readonly PlaceId[];
  viewport: Size;
  shown: boolean;
  /** Moved by the game loop (useHeroController), through its transform only. */
  heroRef: RefObject<HTMLSpanElement | null>;
}

/**
 * The world in a corner: the background image averaged into a few thousand
 * pixels, drawn once, the places of the quest (squares, filled once visited)
 * and the hero. Decorative for screen readers: the HUD says where the hero
 * is, the quest log what is done.
 */
export function Minimap({
  layout,
  image,
  background,
  ready,
  visited,
  viewport,
  shown,
  heroRef,
}: MinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ready) return;
    let cancelIdle: (() => void) | null = null;
    let cancelled = false;
    const picture = new Image();
    picture.src = image;
    // Without a picture, the minimap keeps the colour of the sea, and its markers.
    const keepTheSea = () => undefined;
    decoded(picture).then(() => {
      if (cancelled) return;
      cancelIdle = whenIdle(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const { frame, blockSize } = layout;
        const source = {
          x: frame.x - background.x,
          y: frame.y - background.y,
          width: frame.width,
          height: frame.height,
        };
        drawMinimap(canvas, picture, source, blockSize).catch(keepTheSea);
      });
    }, keepTheSea);
    return () => {
      cancelled = true;
      cancelIdle?.();
    };
  }, [ready, image, background, layout]);

  const scale = minimapScale(viewport, layout.width, window.devicePixelRatio);
  const markers = spreadMarkers(layout.places, (MARKER_SIZE + MARKER_GAP) / scale, layout);
  // On the middle of a minimap pixel, like the hero: whole device pixels, crisp edges.
  const percent = (value: number, length: number) =>
    `${((Math.floor(value) + 0.5) / length) * 100}%`;

  return (
    <div className="minimap panel" hidden={!shown} aria-hidden="true">
      <div
        className="minimap__map"
        style={{ width: layout.width * scale, height: layout.height * scale }}
      >
        <canvas
          ref={canvasRef}
          className="minimap__canvas"
          width={layout.width}
          height={layout.height}
        />
        {markers.map(({ placeId, x, y }) => (
          <span
            key={placeId}
            className="minimap__place"
            data-place={placeId}
            data-visited={visited.includes(placeId) ? '' : undefined}
            style={{ left: percent(x, layout.width), top: percent(y, layout.height) }}
          />
        ))}
        <span ref={heroRef} className="minimap__hero-layer">
          <span className="minimap__hero" />
        </span>
      </div>
    </div>
  );
}
