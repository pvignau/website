import { content, ui } from '../content';
import { Dialog } from './Dialog';

/** "How to play": shown on the first visit, reopened with the "?" button or key. */
export function HelpDialog({
  onClose,
  onTextVersion,
}: {
  onClose: () => void;
  onTextVersion: () => void;
}) {
  const { help } = content;
  return (
    <Dialog
      open
      onClose={onClose}
      title={help.title}
      eyebrow={content.name}
      footer={
        <>
          <button
            type="button"
            className="pixel-button pixel-button--quiet"
            onClick={onTextVersion}
          >
            {help.textVersionLabel}
          </button>
          <button type="button" className="pixel-button" onClick={onClose}>
            {ui.help.start}
          </button>
        </>
      }
    >
      <p className="content-paragraph">{content.pitch}</p>
      <ol className="content-list help-steps">
        {help.steps.map((step, index) => (
          <li key={index}>{step}</li>
        ))}
      </ol>
    </Dialog>
  );
}
