import { ExternalLinkIcon, SearchIcon } from './icons';

type TopbarProps = {
  query: string;
  onQueryChange: (value: string) => void;
};

export function Topbar({ query, onQueryChange }: TopbarProps) {
  return (
    <header className="topbar">
      <label className="topbar-search">
        <SearchIcon />
        <input
          type="search"
          placeholder="Search by name, SKU or category..."
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          aria-label="Search products"
        />
      </label>

      <div className="topbar-actions">
        <a
          className="docs-link"
          href="http://localhost:3000/api-docs"
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
