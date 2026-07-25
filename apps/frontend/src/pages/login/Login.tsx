import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/auth.service';
import { useAuth } from '../../hooks/useAuth';
import './Login.css';

type DemoAccount = {
  label: string;
  username: string;
  password: string;
};

const DEMO_ACCOUNTS: DemoAccount[] = [
  { label: 'Admin', username: 'admin', password: 'Admin@123' },
  { label: 'Staff', username: 'staff01', password: 'Staff@123' },
];

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { saveTokens } = useAuth();
  const navigate = useNavigate();

  const selectDemoAccount = (account: DemoAccount) => {
    setUsername(account.username);
    setPassword(account.password);
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await login(username, password);
      saveTokens(result.accessToken, result.refreshToken);
      navigate('/products');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>Đăng nhập</h1>

        <div className="demo-accounts" aria-label="Tài khoản dùng thử">
          <div className="demo-accounts__header">
            <strong>Tài khoản dùng thử</strong>
            <span>Nhấn để điền nhanh</span>
          </div>

          <div className="demo-accounts__list">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.username}
                type="button"
                className="demo-account"
                onClick={() => selectDemoAccount(account)}
              >
                <span className="demo-account__role">{account.label}</span>
                <span>
                  <b>Tài khoản:</b> {account.username}
                </span>
                <span>
                  <b>Mật khẩu:</b> {account.password}
                </span>
              </button>
            ))}
          </div>
        </div>

        <label className="login-field">
          Username
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nhập tài khoản"
            autoComplete="username"
            required
          />
        </label>
        <label className="login-field">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu"
            autoComplete="current-password"
            required
          />
        </label>
        {error && <div className="state-panel state-error">{error}</div>}
        <button type="submit" className="login-submit" disabled={loading}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
    </div>
  );
}
