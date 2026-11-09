import type { AnchorHTMLAttributes } from 'react';
import { useNavigate } from './navigation';

/**
 * A link to a path of the site, followed without reloading the page. A click
 * with a modifier key or another button, or a link with a target, is left to
 * the browser (new tab, new window).
 */
export function Link({
  to,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) {
  const navigate = useNavigate();
  return (
    <a
      {...props}
      href={to}
      onClick={(event) => {
        props.onClick?.(event);
        const plainClick =
          event.button === 0 &&
          !event.metaKey &&
          !event.ctrlKey &&
          !event.shiftKey &&
          !event.altKey &&
          props.target === undefined;
        if (event.defaultPrevented || !plainClick) return;
        event.preventDefault();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}
