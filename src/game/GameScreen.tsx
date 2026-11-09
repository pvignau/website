import { useCallback, useEffect, useRef, useState } from 'react';
import type { AppLocation } from '../app/history';
import { routeOf } from '../app/location';
import { useHistory, useLocation, useNavigate } from '../app/navigation';
import { pageOf } from '../app/pages';
import { usePageMeta } from '../app/usePageMeta';
import type { PlaceId } from '../content';
import { content, ui } from '../content';
import { computeScale } from '../engine/camera';
import type { Direction } from '../engine/input';
import type { Interactable } from '../engine/tiled';
import { findSpawn } from '../engine/tiled';
import type { ZoomDirection, ZoomLevel } from '../engine/zoom';
import { createWheelZoom, DEFAULT_ZOOM, stepZoom, zoomedScale } from '../engine/zoom';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { useElementSize } from '../lib/useElementSize';
import { useImagesReady } from '../lib/useImagesReady';
import { COARSE_POINTER, useMediaQuery } from '../lib/useMediaQuery';
import { questStore, useVisitedPlaces } from '../quest/useQuest';
import { HelpDialog } from '../ui/HelpDialog';
import { TextVersionIcon } from '../ui/icons';
import { Hud } from '../ui/Hud';
import { Loader } from '../ui/Loader';
import { MapControls } from '../ui/MapControls';
import { PlaceDialog } from '../ui/PlaceDialog';
import { QuestLog } from '../ui/QuestLog';
import { TEXT_VERSION_ID, TextVersion } from '../ui/TextVersion';
import { TouchPad } from '../ui/TouchPad';
import './GameScreen.css';
import { helpSeen } from './helpSeen';
import { HERO_SPRITE_URLS } from './heroSprites';
import { objectLabel, zoneName } from './labels';
import type { MapDefinition, MapId } from './maps';
import { MAPS } from './maps';
import type { Overlay, OverlayState } from './overlay';
import { overlayOf, overlayPlace } from './overlay';
import { zoomPreference } from './preferences';
import { useHeroController } from './useHeroController';
import { useKeyboardControls } from './useKeyboardControls';
import { WorldView } from './WorldView';

/** How long a one-off HUD message ("nothing here") stays. */
const MESSAGE_MS = 2500;
/** Room enough to keep the quest log open next to the HUD (not a phone in landscape). */
const WIDE_SCREEN = '(min-width: 48rem) and (min-height: 36rem)';

/** Navigation state set by doors, so the next map spawns the hero in front of the right one. */
interface ArrivalState {
  from: string;
}

function isArrivalState(state: unknown): state is ArrivalState {
  return (
    typeof state === 'object' && state !== null && typeof (state as ArrivalState).from === 'string'
  );
}

/** The spawn to use: the route the hero comes from, or else the current route (deep links). */
function arrivalRoute(location: AppLocation): string | null {
  return isArrivalState(location.state) ? location.state.from : routeOf(location.pathname);
}

/** Place whose own URL is the current one (`/work`, or `/work/` served by 404.html), if any. */
function placeAtPath(map: MapDefinition, pathname: string): PlaceId | null {
  const route = routeOf(pathname);
  const entry = Object.entries(map.placeRoutes).find(([, placeRoute]) => placeRoute === route);
  return (entry?.[0] as PlaceId | undefined) ?? null;
}

function pageTitle(map: MapDefinition, openPlace: PlaceId | null): string {
  if (openPlace !== null) return ui.pageTitle(content.places[openPlace].title);
  return ui.pageTitle(map.place === null ? null : content.places[map.place].zone);
}

export function GameScreen({ mapId }: { mapId: MapId }) {
  const map = MAPS[mapId];
  const location = useLocation();
  const navigate = useNavigate();
  const history = useHistory();
  const debug = new URLSearchParams(location.search).has('debug');
  const touch = useMediaQuery(COARSE_POINTER);
  const wide = useMediaQuery(WIDE_SCREEN);
  const visited = useVisitedPlaces();

  const [spawn] = useState(() => findSpawn(map.data, arrivalRoute(location)));
  const [nearest, setNearest] = useState<Interactable<PlaceId> | null>(null);
  const [announcement, setAnnouncement] = useState({ id: 0, text: '' });
  const announce = useCallback((text: string) => {
    setAnnouncement((previous) => ({ id: previous.id + 1, text }));
  }, []);
  // What is open follows the address and its history entry: Back closes it.
  const entryOverlay = overlayOf(location.state);
  const routePlace = placeAtPath(map, location.pathname);
  // The house greets a first visit on arrival, without a history entry of its own.
  const [greeting, setGreeting] = useState<PlaceId | null>(() => {
    const intro = map.introPlace;
    const quiet = routePlace !== null || entryOverlay !== null;
    return intro !== null && !quiet && !questStore.getSnapshot().includes(intro) ? intro : null;
  });
  const openPlace = routePlace ?? overlayPlace(entryOverlay) ?? greeting;
  const textOpen = entryOverlay === 'text';
  const [helpWasSeen, setHelpWasSeen] = useState(helpSeen.get);
  // First visit: the help shows as soon as nothing else is open, after a dialog opened by
  // a deep link (/work) or the greeting of the house, too.
  const helpOpen = entryOverlay === 'help' || (!helpWasSeen && openPlace === null && !textOpen);
  const [message, setMessage] = useState<string | null>(null);
  const ready = useImagesReady([map.image, ...HERO_SPRITE_URLS]);

  const viewportRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const hitboxRef = useRef<SVGRectElement>(null);
  const coordinatesRef = useRef<HTMLOutputElement>(null);
  const textButtonRef = useRef<HTMLButtonElement>(null);
  const touchDirections = useRef<ReadonlySet<Direction>>(new Set());
  const viewport = useElementSize(viewportRef);

  // The zoom multiplies the default framing; levels that round to the same scale count once.
  const [zoom, setZoom] = useState<ZoomLevel>(() => zoomPreference.get() ?? DEFAULT_ZOOM);
  const dpr = window.devicePixelRatio;
  const baseScale = computeScale(viewport, map.data.tileSize, dpr);
  const scaleAt = (level: ZoomLevel) => zoomedScale(baseScale, level, dpr);
  const scale = scaleAt(zoom);
  const zoomSteps = { in: stepZoom(zoom, 1, scaleAt), out: stepZoom(zoom, -1, scaleAt) };
  const zoomBy = (direction: ZoomDirection) => {
    const level = direction === 1 ? zoomSteps.in : zoomSteps.out;
    if (level === null) return;
    setZoom(level);
    zoomPreference.set(level);
  };
  const [wheelZoom] = useState(createWheelZoom);

  const playing = ready && openPlace === null && !helpOpen && !textOpen;
  useDocumentTitle(pageTitle(map, openPlace));
  usePageMeta(pageOf(routeOf(location.pathname) ?? map.path));

  // A place counts as visited as soon as its dialog opens.
  useEffect(() => {
    if (openPlace !== null) questStore.markVisited(openPlace);
  }, [openPlace]);

  useEffect(() => {
    if (message === null) return;
    const timer = window.setTimeout(() => {
      setMessage(null);
    }, MESSAGE_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [message]);

  /** Opens an overlay in a new history entry; a place with its own route (work) also shows it, shareable. */
  const openOverlay = (overlay: Overlay, path = location.pathname, replace = false) => {
    const state: OverlayState = { overlay };
    navigate(`${path}${location.search}`, { state, replace });
  };
  /**
   * Takes off the entry added when `overlay` opened, as Back does. It reads the live
   * entry, not the one of the last render: a dialog closing late, or twice, is a no-op.
   */
  const leaving = useRef<unknown>(undefined);
  const leaveOverlay = useCallback(
    (overlay: Overlay): boolean => {
      const { state } = history.location();
      if (overlayOf(state) !== overlay) return false;
      if (leaving.current !== state) {
        leaving.current = state;
        history.back();
      }
      return true;
    },
    [history],
  );

  const closeHelp = useCallback(() => {
    setHelpWasSeen(true);
    helpSeen.mark();
    leaveOverlay('help');
  }, [leaveOverlay]);
  const openTextVersion = () => {
    if (helpOpen) {
      setHelpWasSeen(true);
      helpSeen.mark();
    }
    // From the help's own entry, take its place: Back then leads to the game.
    openOverlay('text', location.pathname, entryOverlay === 'help');
  };
  const closeTextVersion = useCallback(() => {
    leaveOverlay('text');
  }, [leaveOverlay]);

  const showPlace = (place: PlaceId) => {
    openOverlay(place, map.placeRoutes[place] ?? location.pathname);
  };
  const closePlace = (place: PlaceId) => {
    if (leaveOverlay(place)) return;
    const live = history.location();
    // Opened by a deep link (/work): back to the map's address, without adding an entry.
    if (placeAtPath(map, live.pathname) === place) {
      navigate(`${map.path}${live.search}`, { replace: true });
    } else {
      setGreeting(null);
    }
  };

  const interact = () => {
    if (!nearest) {
      setMessage(ui.hud.nothingHere);
      announce(ui.hud.nothingHere);
      return;
    }
    setMessage(null);
    if (nearest.kind === 'place') {
      showPlace(nearest.placeId);
      return;
    }
    const arrival: ArrivalState = { from: location.pathname };
    navigate(`${nearest.to}${location.search}`, { state: arrival });
  };

  /** What was last said about the nearby object: one place may span several objects. */
  const saidNearby = useRef('');
  const onNearestChange = useCallback(
    (item: Interactable<PlaceId> | null) => {
      setNearest(item);
      // Coming near something is worth saying; walking away is not.
      const text =
        item === null
          ? ''
          : `${zoneName(item, map, content, ui)}. ${ui.hud.interact[touch ? 'touch' : 'keyboard'](objectLabel(item, content, ui))}`;
      if (text !== saidNearby.current) announce(text);
      saidNearby.current = text;
    },
    [announce, map, touch],
  );

  const keys = useKeyboardControls({
    enabled: playing,
    onInteract: interact,
    onHelp: () => {
      openOverlay('help');
    },
    onZoom: zoomBy,
  });
  const readDirections = useCallback(
    () => new Set<Direction>([...keys.current.values(), ...touchDirections.current]),
    [keys],
  );

  const hero = useHeroController({
    map: map.data,
    spawn,
    active: playing,
    viewport,
    scale,
    elements: { world: worldRef, hero: heroRef, hitbox: hitboxRef, coordinates: coordinatesRef },
    readDirections,
    onNearestChange,
  });

  const target = nearest && objectLabel(nearest, content, ui);
  const hint =
    message ??
    (target === null
      ? ui.hud.explore[touch ? 'touch' : 'keyboard']
      : ui.hud.interact[touch ? 'touch' : 'keyboard'](target));

  return (
    <div className="game" style={{ '--backdrop': map.backdrop }}>
      <a
        className="skip-link pixel-button"
        href={`#${TEXT_VERSION_ID}`}
        inert={textOpen}
        onClick={(event) => {
          event.preventDefault();
          openTextVersion();
        }}
      >
        {ui.skipLink}
      </a>

      <main className="game__main">
        <div className="game__stage" inert={textOpen}>
          <section
            className="game__viewport"
            ref={viewportRef}
            aria-label={ui.game.label}
            onWheel={(event) => {
              if (!ready) return;
              const direction = wheelZoom(event);
              if (direction !== null) zoomBy(direction);
            }}
            onPointerDown={
              debug
                ? (event) => {
                    // ?debug: click the map to teleport the hero there.
                    const world = worldRef.current?.getBoundingClientRect();
                    if (!world) return;
                    hero.teleport({
                      x: (event.clientX - world.left) / scale,
                      y: (event.clientY - world.top) / scale,
                    });
                  }
                : undefined
            }
          >
            <WorldView
              map={map}
              scale={scale}
              nearest={nearest}
              debug={debug}
              worldRef={worldRef}
              heroRef={heroRef}
              hitboxRef={hitboxRef}
            />
          </section>

          {/* One bar: the HUD gives way to the toolbar, which never covers it. */}
          <div className="game__top">
            <Hud
              zone={zoneName(nearest, map, content, ui)}
              hint={hint}
              announcement={announcement}
            />

            <div className="toolbar" role="group" aria-label={ui.toolbar.label}>
              <div className="toolbar__buttons">
                <button
                  type="button"
                  className="pixel-button pixel-button--quiet"
                  title={ui.toolbar.help}
                  aria-keyshortcuts={ui.toolbar.helpShortcut}
                  onClick={() => {
                    openOverlay('help');
                  }}
                >
                  <span aria-hidden="true">{ui.toolbar.helpShortcut}</span>
                  <span className="visually-hidden">{ui.toolbar.help}</span>
                </button>
                <button
                  type="button"
                  ref={textButtonRef}
                  className="pixel-button pixel-button--quiet toolbar__text"
                  onClick={openTextVersion}
                >
                  <TextVersionIcon />
                  {/* On phones only the icon shows; the name stays for screen readers. */}
                  <span className="toolbar__label">{content.help.textVersionLabel}</span>
                </button>
              </div>
              <QuestLog visited={visited} initiallyOpen={wide} />
            </div>
          </div>

          <MapControls
            canZoomIn={zoomSteps.in !== null}
            canZoomOut={zoomSteps.out !== null}
            onZoom={zoomBy}
          />
          <TouchPad directionsRef={touchDirections} onAction={interact} enabled={playing} />
          {debug && (
            <output ref={coordinatesRef} className="debug-coordinates" aria-hidden="true" />
          )}
        </div>

        <TextVersion open={textOpen} onClose={closeTextVersion} returnFocus={textButtonRef} />
      </main>

      {openPlace && (
        <PlaceDialog
          key={openPlace}
          place={content.places[openPlace]}
          onClose={() => {
            closePlace(openPlace);
          }}
        />
      )}
      {helpOpen && <HelpDialog onClose={closeHelp} onTextVersion={openTextVersion} />}
      {!ready && <Loader label={ui.loading} />}
    </div>
  );
}
