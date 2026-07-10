import { useState } from 'react';
import { login } from '../../services/auth.service';
import './Login.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await login(username, password);
      console.log(result); // Task 10 sẽ thay dòng này bằng việc lưu token thật
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
        <label className="login-field">
          Username
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nhập tài khoản"
          />
        </label>
        <label className="login-field">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu"
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
