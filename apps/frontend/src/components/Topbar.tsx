import { ExternalLinkIcon } from './icons';

export function Topbar() {
  return (
    <header className="topbar">
      <div className="topbar-actions">
        <a
          className="docs-link"
          href="/api-docs"
          target="_blank"
          rel="noreferrer"
        >
          <span>API docs</span>
          <ExternalLinkIcon />
        </a>
        <div className="user-chip" title="Signed in">
          <span className="user-avatar">WM</span>
        </div>
      </div>
    </header>
  );
}
