import type { ReactNode } from 'react';
import { ui } from '../content';
import type { ZoomDirection } from '../engine/zoom';
import { MinimapIcon, ZoomIcon } from './icons';
import './MapControls.css';

interface ZoomButtonProps {
  direction: ZoomDirection;
  /** False at the end of the range: the button stays focusable, and does nothing. */
  enabled: boolean;
  onZoom: (direction: ZoomDirection) => void;
}

function ZoomButton({ direction, enabled, onZoom }: ZoomButtonProps) {
  const copy = ui.mapControls;
  const name = direction === 1 ? copy.zoomIn : copy.zoomOut;
  return (
    <button
      type="button"
      className="pixel-button pixel-button--quiet map-controls__button"
      title={name}
      aria-keyshortcuts={direction === 1 ? copy.zoomInShortcut : copy.zoomOutShortcut}
      // Not `disabled`: a disabled button loses the focus, which would fall back to the page.
      aria-disabled={enabled ? undefined : true}
      onClick={() => {
        if (enabled) onZoom(direction);
      }}
    >
      <ZoomIcon direction={direction} />
      <span className="visually-hidden">{name}</span>
    </button>
  );
}

/**
 * The bottom corner of the screen, over the map: zoom out and in and, on a
 * map that has one, the minimap (`children`) with the button that folds it.
 */
export function MapControls({
  canZoomIn,
  canZoomOut,
  onZoom,
  minimap,
  children,
}: {
  canZoomIn: boolean;
  canZoomOut: boolean;
  onZoom: (direction: ZoomDirection) => void;
  /** Whether the minimap shows, and how to fold or unfold it; none on a map without one. */
  minimap?: { shown: boolean; onToggle: () => void };
  children?: ReactNode;
}) {
  return (
    <div className="map-controls" role="group" aria-label={ui.mapControls.label}>
      {children}
      <div className="map-controls__buttons">
        <ZoomButton direction={-1} enabled={canZoomOut} onZoom={onZoom} />
        <ZoomButton direction={1} enabled={canZoomIn} onZoom={onZoom} />
        {minimap && (
          <button
            type="button"
            className="pixel-button pixel-button--quiet map-controls__button"
            title={ui.mapControls.minimap}
            aria-pressed={minimap.shown}
            onClick={minimap.onToggle}
          >
            <MinimapIcon />
            <span className="visually-hidden">{ui.mapControls.minimap}</span>
          </button>
        )}
      </div>
    </div>
  );
}
