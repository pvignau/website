import { useState } from 'react';
import type { PlaceId } from '../content';
import { content, PLACE_IDS, ui } from '../content';
import './QuestLog.css';

/** Collapsible quest log: one objective per place, ticked once its dialog was opened. */
export function QuestLog({
  visited,
  initiallyOpen,
}: {
  visited: readonly PlaceId[];
  initiallyOpen: boolean;
}) {
  const [open, setOpen] = useState(initiallyOpen);
  const done = PLACE_IDS.filter((id) => visited.includes(id)).length;
  const complete = done === PLACE_IDS.length;

  return (
    <details
      className="quest panel"
      open={open}
      onToggle={(event) => {
        setOpen(event.currentTarget.open);
      }}
    >
      <summary className="quest__summary">
        <span className="quest__title">{ui.quest.title}</span>
        <span className="quest__progress">
          <span aria-hidden="true">{ui.quest.progress(done, PLACE_IDS.length)}</span>
          <span className="visually-hidden">{ui.quest.progressLabel(done, PLACE_IDS.length)}</span>
        </span>
      </summary>
      <div className="quest__body">
        <ul className="quest__list">
          {PLACE_IDS.map((id) => {
            const isDone = visited.includes(id);
            return (
              <li key={id} className="quest__item" data-done={isDone ? '' : undefined}>
                <span className="quest__check" aria-hidden="true" />
                <span>{content.places[id].quest}</span>
                <span className="visually-hidden">{isDone ? ui.quest.done : ui.quest.todo}</span>
              </li>
            );
          })}
        </ul>
        {complete && <p className="quest__complete">{ui.quest.complete}</p>}
      </div>
    </details>
  );
}
