import { useNavigate } from 'react-router-dom';
import { ExternalLinkIcon } from './icons';
import { useAuth } from '../hooks/useAuth';

export function Topbar() {
  const { isAuthenticated, logout } = useAuth();
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

        {loggedIn ? (
          <>
            <div className="user-chip" title="Signed in">
              <span className="user-avatar">WM</span>
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