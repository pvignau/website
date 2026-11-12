/** Same markup as the boot loader in index.html, so the hand-over is seamless. */
export function Loader({ label }: { label: string }) {
  return (
    <div id="loader" className="loader" role="status">
      <span className="loader__squares" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <span className="loader__label">{label}</span>
    </div>
  );
}
