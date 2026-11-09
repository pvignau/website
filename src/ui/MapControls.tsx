import { ui } from '../content';
import type { ZoomDirection } from '../engine/zoom';
import { ZoomIcon } from './icons';
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

/** Buttons in the bottom corner of the screen, over the map: zoom out and in. */
export function MapControls({
  canZoomIn,
  canZoomOut,
  onZoom,
}: {
  canZoomIn: boolean;
  canZoomOut: boolean;
  onZoom: (direction: ZoomDirection) => void;
}) {
  return (
    <div className="map-controls" role="group" aria-label={ui.mapControls.label}>
      <div className="map-controls__buttons">
        <ZoomButton direction={-1} enabled={canZoomOut} onZoom={onZoom} />
        <ZoomButton direction={1} enabled={canZoomIn} onZoom={onZoom} />
      </div>
    </div>
  );
}
