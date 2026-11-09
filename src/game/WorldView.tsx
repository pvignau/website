import type { RefObject } from 'react';
import type { PlaceId } from '../content';
import { content, ui } from '../content';
import type { Interactable } from '../engine/tiled';
import { DebugOverlay } from './DebugOverlay';
import { objectLabel } from './labels';
import type { MapDefinition } from './maps';

interface WorldViewProps {
  map: MapDefinition;
  scale: number;
  nearest: Interactable<PlaceId> | null;
  debug: boolean;
  worldRef: RefObject<HTMLDivElement | null>;
  heroRef: RefObject<HTMLDivElement | null>;
  hitboxRef: RefObject<SVGRectElement | null>;
}

/**
 * The scaled map: background, decorations, labels and hero. Positions are
 * map pixels times `scale`; the camera and the hero move through transforms
 * written by useHeroController.
 */
export function WorldView({
  map,
  scale,
  nearest,
  debug,
  worldRef,
  heroRef,
  hitboxRef,
}: WorldViewProps) {
  const { data } = map;
  const { background } = data;
  return (
    <div
      ref={worldRef}
      className={map.sea ? 'world world--sea' : 'world'}
      style={{ width: data.width * scale, height: data.height * scale, '--s': scale }}
    >
      <img
        className="world__background"
        src={map.image}
        alt={ui.game.mapAlt[map.id]}
        draggable={false}
        style={{
          left: background.x * scale,
          top: background.y * scale,
          width: background.width * scale,
          height: background.height * scale,
        }}
      />
      {data.decorations.map(({ id, kind, rect }) => (
        <span
          key={id}
          className={`decor decor--${kind}`}
          aria-hidden="true"
          style={{
            left: rect.x * scale,
            top: rect.y * scale,
            width: rect.width * scale,
            height: rect.height * scale,
          }}
        />
      ))}
      <div ref={heroRef} className="hero" aria-hidden="true" />
      {data.interactables.map((item) => (
        <span
          key={item.id}
          className="object-label"
          data-near={item.id === nearest?.id ? '' : undefined}
          aria-hidden="true"
          style={{ left: (item.rect.x + item.rect.width / 2) * scale, top: item.rect.y * scale }}
        >
          {objectLabel(item, content, ui)}
        </span>
      ))}
      {debug && <DebugOverlay map={data} scale={scale} hitboxRef={hitboxRef} />}
    </div>
  );
}
