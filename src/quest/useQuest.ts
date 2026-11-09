import { useSyncExternalStore } from 'react';
import type { PlaceId } from '../content';
import { PLACE_IDS } from '../content';
import { getLocalStorage } from '../lib/storage';
import { createQuestStore, QUEST_STORAGE_KEY } from './questStore';

/** The quest of this browser. Other tabs' progress is picked up through `storage` events. */
export const questStore = createQuestStore<PlaceId>({
  storage: getLocalStorage(),
  placeIds: PLACE_IDS,
});

window.addEventListener('storage', (event) => {
  if (event.key === QUEST_STORAGE_KEY || event.key === null) questStore.refresh();
});

/** Visited places, re-rendering when the quest advances. */
export function useVisitedPlaces(): readonly PlaceId[] {
  return useSyncExternalStore(questStore.subscribe, questStore.getSnapshot, questStore.getSnapshot);
}
