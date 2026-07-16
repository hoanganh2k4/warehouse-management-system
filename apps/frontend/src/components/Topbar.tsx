import { useNavigate } from 'react-router-dom';
import { ExternalLinkIcon } from './icons';
import { useAuth } from '../hooks/useAuth';

function initialsOf(username: string): string {
  return username.slice(0, 2).toUpperCase();
}

export function Topbar() {
  const { isAuthenticated, logout, username, role } = useAuth();
  const navigate = useNavigate();
  const loggedIn = isAuthenticated();

  function handleLogout() {
    logout();
    navigate('/login');
  }

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

        {loggedIn && username ? (
          <>
            <div className="user-chip" title={role ? `${username} · ${role}` : username}>
              <span className="user-avatar">{initialsOf(username)}</span>
              <span className="user-chip-text">
                <strong>{username}</strong>
                {role && <small>{role}</small>}
              </span>
            </div>
            <button type="button" className="docs-link" onClick={handleLogout}>
              Đăng xuất
            </button>
          </>
        ) : (
          <button type="button" className="docs-link" onClick={() => navigate('/login')}>
            Đăng nhập
          </button>
        )}
      </div>
    </header>
  );
}
