import './Hud.css';

/**
 * Where the hero is and what the next key does. Screen readers do not get every
 * change of it: `announcement` goes to a separate live region, said when the
 * hero comes near something or a key finds nothing. Each announcement is a new
 * node, so the same words said twice are heard twice.
 */
export function Hud({
  zone,
  hint,
  announcement,
}: {
  zone: string;
  hint: string;
  announcement: { id: number; text: string };
}) {
  return (
    <>
      <div className="hud panel">
        <p className="hud__zone">{zone}</p>
        <p className="hud__hint">{hint}</p>
      </div>
      <p className="visually-hidden" role="status">
        <span key={announcement.id}>{announcement.text}</span>
      </p>
    </>
  );
}
